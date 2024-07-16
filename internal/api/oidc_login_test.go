package api

import (
	"net/http"
	"testing"

	"github.com/photoprism/photoprism/internal/config"

	"github.com/stretchr/testify/assert"
)

func TestOIDCLogin(t *testing.T) {
	t.Run("PublicMode", func(t *testing.T) {
		app, router, _ := NewApiTest()

		OIDCLogin(router)

		r := PerformRequest(app, http.MethodGet, "/api/v1/oidc/login")
		assert.Equal(t, http.StatusTemporaryRedirect, r.Code)
	})
	t.Run("OIDCNotEnabled", func(t *testing.T) {
		app, router, conf := NewApiTest()
		conf.SetAuthMode(config.AuthModePasswd)
		defer conf.SetAuthMode(config.AuthModePublic)

		OIDCLogin(router)

		r := PerformRequest(app, http.MethodGet, "/api/v1/oidc/login")
		assert.Equal(t, http.StatusTemporaryRedirect, r.Code)
	})
	t.Run("Success", func(t *testing.T) {
		app, router, conf := NewApiTest()
		conf.SetAuthMode(config.AuthModePasswd)
		defer conf.SetAuthMode(config.AuthModePublic)

		conf.Options().OIDCUri = "https://keycloak.localssl.dev/realms/master"
		conf.Options().SiteUrl = "https://app.localssl.dev/"
		conf.Options().OIDCClient = "photoprism-develop"
		conf.Options().OIDCSecret = "9d8351a0-ca01-4556-9c37-85eb634869b9"

		OIDCLogin(router)

		r := PerformRequest(app, http.MethodGet, "/api/v1/oidc/login")
		assert.Equal(t, http.StatusFound, r.Code)
	})
}