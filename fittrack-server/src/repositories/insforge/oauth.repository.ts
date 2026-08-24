import type { IOAuthRepository } from "../interfaces/IOAuthRepository";
import type {
    OAuthClientRow,
    CreateOAuthClientDto,
    OAuthAuthorizationCodeRow,
    CreateAuthorizationCodeDto,
    OAuthRefreshTokenRow,
    CreateRefreshTokenDto,
} from "../../shared/index";
import { insforgeAdmin } from "../../config/insforge";
import { AppError } from "../../utils/errors";

export class InsForgeOAuthRepository implements IOAuthRepository {
    private readonly clientTable = "oauth_clients";
    private readonly codeTable = "oauth_authorization_codes";
    private readonly refreshTable = "oauth_refresh_tokens";

    async createClient(dto: CreateOAuthClientDto): Promise<OAuthClientRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.clientTable)
            .insert([dto])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as OAuthClientRow;
    }

    async findClientByClientId(clientId: string): Promise<OAuthClientRow | null> {
        const { data, error } = await insforgeAdmin.database
            .from(this.clientTable)
            .select()
            .eq("client_id", clientId)
            .maybeSingle();

        if (error) throw AppError.internal(error.message);
        return (data as OAuthClientRow | null) ?? null;
    }

    async createAuthorizationCode(dto: CreateAuthorizationCodeDto): Promise<OAuthAuthorizationCodeRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.codeTable)
            .insert([dto])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as OAuthAuthorizationCodeRow;
    }

    async findAuthorizationCodeByCode(code: string): Promise<OAuthAuthorizationCodeRow | null> {
        const { data, error } = await insforgeAdmin.database
            .from(this.codeTable)
            .select()
            .eq("code", code)
            .maybeSingle();

        if (error) throw AppError.internal(error.message);
        return (data as OAuthAuthorizationCodeRow | null) ?? null;
    }

    async markAuthorizationCodeUsed(id: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.codeTable)
            .update({ used: true })
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }

    async createRefreshToken(dto: CreateRefreshTokenDto): Promise<OAuthRefreshTokenRow> {
        const { data, error } = await insforgeAdmin.database
            .from(this.refreshTable)
            .insert([dto])
            .select()
            .single();

        if (error) throw AppError.internal(error.message);
        return data as OAuthRefreshTokenRow;
    }

    async findRefreshTokenByToken(token: string): Promise<OAuthRefreshTokenRow | null> {
        const { data, error } = await insforgeAdmin.database
            .from(this.refreshTable)
            .select()
            .eq("refresh_token", token)
            .maybeSingle();

        if (error) throw AppError.internal(error.message);
        return (data as OAuthRefreshTokenRow | null) ?? null;
    }

    async updateRefreshTokenInsforgeToken(id: string, insforgeRefreshToken: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.refreshTable)
            .update({ insforge_refresh_token: insforgeRefreshToken })
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }

    async revokeRefreshToken(id: string): Promise<void> {
        const { error } = await insforgeAdmin.database
            .from(this.refreshTable)
            .update({ revoked: true })
            .eq("id", id);

        if (error) throw AppError.internal(error.message);
    }
}
