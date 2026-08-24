import { Router } from "express";
import express from "express";
import type { OAuthService } from "../services/oauth.service";
import { protectedResourceMetadata, authorizationServerMetadata } from "./metadata";
import { createRegisterHandler } from "./register";
import { createAuthorizeHandler } from "./authorize";
import { createConsentHandler } from "./consent";
import { createTokenHandler } from "./token";

// RFC 9728 / RFC 8414 well-known endpoints — must live at the domain root, not under /oauth.
export function createOAuthMetadataRouter(): Router {
    const router = Router();
    router.get("/.well-known/oauth-protected-resource", protectedResourceMetadata);
    router.get("/.well-known/oauth-authorization-server", authorizationServerMetadata);
    return router;
}

export function createOAuthRouter(oauthService: OAuthService): Router {
    const router = Router();

    // Token requests are typically application/x-www-form-urlencoded per RFC 6749.
    router.use(express.urlencoded({ extended: true }));

    router.post("/register", createRegisterHandler(oauthService));
    router.get("/authorize", createAuthorizeHandler(oauthService));
    router.post("/consent", createConsentHandler(oauthService));
    router.post("/token", createTokenHandler(oauthService));

    return router;
}
