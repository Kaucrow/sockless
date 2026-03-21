import type { Express, Request, Response } from 'express';
import expressSession from 'express-session';
import {
  generateKeys as generatePasetoKeys,
  sign as pasetoSign,
  verify as pasetoVerify,
} from 'paseto-ts/v4';
import cookieParser from 'cookie-parser';

import type { UUID } from '@/types/global.js';
import type { Session } from '@/types/session.js';
import { logger } from './logger.js';
import { session as sessionFileConfig } from '@global/constants.js';

class SessionComponent {
  static #instance: SessionComponent;

  private type: 'express' | 'paseto' | undefined = undefined;

  private pasetoKeys: {
    secret: string,
    public: string
  } | undefined = undefined;

  private tokenSessions: Set<string> | undefined = undefined;

  private constructor() {}

  public static get instance(): SessionComponent {
    if (!SessionComponent.#instance) {
      SessionComponent.#instance = new SessionComponent();
    }
    return SessionComponent.#instance;
  }

  public init(app: Express, type: 'express' | 'paseto') {
    this.type = type;

    switch (type) {
      case 'express': {
        // Set up session middleware on the app

        if (!sessionFileConfig.secret) throw new Error("Tried to init an express session, but the session secret key was not found in the config file.");

        const sessionConfig = {
          secret: sessionFileConfig.secret,
          resave: false,
          saveUninitialized: false,
          cookie: {
            maxAge: 60 * 60 * 100,  // 1 hour
            secure: false,
            httpOnly: true,
          }
        };

        app.use(expressSession(sessionConfig));
        break;
      }
      case 'paseto': {
        // Generate PASETO keys
        const { secretKey, publicKey } = generatePasetoKeys('public');
        this.pasetoKeys = {
          secret: secretKey,
          public: publicKey
        };

        // Initialize token sessions set
        this.tokenSessions = new Set();

        // Set up cookie parser middleware on the app
        app.use(cookieParser());

        break;
      }
    }
  }

  public async create(req: Request, res: Response, userId: UUID, profiles: Set<string>): Promise<string | null> {
    if (!this.type) throw new Error("Session has not been initialized. Call session.init() first.");

    switch (this.type) {
      case 'express': {
        req.session.userId = userId;
        req.session.profiles = [...profiles];
        break;
      }
      case 'paseto': {
        // Add the session to the sessions set
        this.tokenSessions!.add(userId);

        try {
          // Build the token
          const payload: Session = { userId, profiles: [...profiles] };
          const token = pasetoSign(this.pasetoKeys!.secret, payload);

          // Set the token as a cookie
          res.cookie('session', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000, // 1 hour
            sameSite: 'strict',
            path: '/',
          });

          return token;
        } catch (err) {
          throw err;
        }
      }
    }

    return null;
  }

  public async exists(req: Request): Promise<boolean> {
    if (!this.type) throw new Error("Session has not been initialized. Call session.init() first.");

    switch (this.type) {
      case 'express': {
        // If userId is set in the session, the user is authenticated
        return req.session.userId ? true : false;
      }
      case 'paseto': {
        try {
          await this.getPasetoPayload(req);
          return true;
        } catch (err) {
          logger.error(String(err));
          return false;
        }
      }
    }
  }

  public async get(req: Request): Promise<Session | null> {
    if (!this.type) throw new Error("Session has not been initialized. Call session.init() first.");
 
    switch (this.type) {
      case 'express': {
        if (!req.session.userId) return null;

        return {
          userId: req.session.userId,
          profiles: req.session.profiles || []
        }
      }
      case 'paseto': {
        try {
          const payload: Session | null = await this.getPasetoPayload(req);
          return payload;
        } catch (err) {
          logger.error(String(err));
          return null;
        }
      }
    }
  }

  public async hasProfile(profile: string, req: Request): Promise<boolean | null> {
    const sessionData = await this.get(req);

    if (!sessionData) return null;

    return sessionData.profiles.includes(profile);
  }

  public async destroy(req: Request, res: Response) {
    if (!this.type) throw new Error("Session has not been initialized. Call session.init() first.");

    switch (this.type) {
      case 'express': {
        req.session.destroy((err) => {
          if (err) throw err
        });
        break;
      }
      case 'paseto': {
        try {
          const payload: Session | null = await this.getPasetoPayload(req);

          if (!payload) {
            logger.error("Cannot delete session server-side since it doesn't exist");
            res.clearCookie('session');
            return;
          }

          this.tokenSessions!.delete(payload.userId);
          res.clearCookie('session');
        } catch (err) {
          logger.error(String(err));
        }
      }
    }
  }
  
  private async getPasetoPayload(req: Request): Promise<Session | null> {
    // Get the token
    let token: string | undefined;

    // Check for token in the Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      // Extract the token part: 'Bearer <token>'
      token = authHeader.split(' ')[1];
    }

    // If no token in the header, check for token in the cookies
    if (!token) token = req.cookies?.session;

    // If still no token, throw an error
    if (!token) {
      throw new Error("No session token found in Authorization header or cookies"); // Token is missing
    }

    try {
      const { payload }: { payload: Session } = pasetoVerify(this.pasetoKeys!.public, token);

      if (!this.tokenSessions!.has(payload.userId)) {
        return null;  // Session set does not have the user ID (might have expired)
      }

      return payload as Session;  // Verification succeeded
    } catch (err) {
      throw err;
    }
  }
};

export const session = SessionComponent.instance;