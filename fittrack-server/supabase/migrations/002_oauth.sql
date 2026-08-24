-- OAuth clients (populated via Dynamic Client Registration)
CREATE TABLE oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT UNIQUE NOT NULL,
    client_secret_hash TEXT NOT NULL,
    client_name TEXT,
    redirect_uris TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);

-- Short-lived, single-use authorization codes issued after consent
CREATE TABLE oauth_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    redirect_uri TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL DEFAULT 'S256',
    resource TEXT,
    insforge_access_token TEXT NOT NULL,
    insforge_refresh_token TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_oauth_auth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX idx_oauth_auth_codes_user_id ON oauth_authorization_codes(user_id);

-- Our own opaque refresh tokens, mapped to the underlying InsForge refresh token
CREATE TABLE oauth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refresh_token TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insforge_refresh_token TEXT NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_oauth_refresh_tokens_token ON oauth_refresh_tokens(refresh_token);
CREATE INDEX idx_oauth_refresh_tokens_user_id ON oauth_refresh_tokens(user_id);

CREATE TRIGGER oauth_refresh_tokens_updated_at
    BEFORE UPDATE ON oauth_refresh_tokens
    FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
