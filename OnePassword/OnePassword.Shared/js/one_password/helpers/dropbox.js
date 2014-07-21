OnePassword.Helpers.Dropbox = {
    KEY: "0k6lggamswvcpeq",
    SECRET: "chani4pw0g54tqk",

    getParams: function () {
        return JSON.parse(OnePassword.Helpers.readLocalSetting('dropboxParams') || "{}")
    },

    setParams: function (params) {
        OnePassword.Helpers.writeLocalSetting('dropboxParams', JSON.stringify(params))
    },

    getClient: function () {
        var options = OnePassword.Helpers.extend({
            key: OnePassword.Helpers.Dropbox.KEY,
            secret: OnePassword.Helpers.Dropbox.SECRET
        }, OnePassword.Helpers.Dropbox.getParams())

        var client = new Dropbox.Client(options)

        if (options.access_token) {
            client._oauth.processRedirectParams(options)
            client.authStep = Dropbox.Client.DONE
        }

        return client
    },

    auth: function () {
        var client = this.getClient()

        client.authDriver(new Dropbox.AuthDriver.WinRT())
        client.authenticate()
    },

    isAuthenticated: function () {
        return OnePassword.Helpers.Dropbox.getClient().isAuthenticated()
    }
}