import type {
    OAuthClientRow,
    CreateOAuthClientDto,
    OAuthAuthorizationCodeRow,
    CreateAuthorizationCodeDto,
    OAuthRefreshTokenRow,
    CreateRefreshTokenDto,
} from "../../shared/index";

export interface IOAuthRepository {
    createClient(dto: CreateOAuthClientDto): Promise<OAuthClientRow>;
    findClientByClientId(clientId: string): Promise<OAuthClientRow | null>;

    createAuthorizationCode(dto: CreateAuthorizationCodeDto): Promise<OAuthAuthorizationCodeRow>;
    findAuthorizationCodeByCode(code: string): Promise<OAuthAuthorizationCodeRow | null>;
    markAuthorizationCodeUsed(id: string): Promise<void>;

    createRefreshToken(dto: CreateRefreshTokenDto): Promise<OAuthRefreshTokenRow>;
    findRefreshTokenByToken(token: string): Promise<OAuthRefreshTokenRow | null>;
    updateRefreshTokenInsforgeToken(id: string, insforgeRefreshToken: string): Promise<void>;
    revokeRefreshToken(id: string): Promise<void>;
}
