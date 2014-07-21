OnePassword.Helpers = {
    t: function (key) {
        var translation = WinJS.Resources.getString(key)

        if (translation.empty) {
            console.log('Untranslated key:', key)
        }

        return translation.value
    },

    extend: function (out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue
            }

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key]
                }
            }
        }

        return out
    },

    getLocalSettings: function () {
        var applicationData = Windows.Storage.ApplicationData.current
          , localSettings = applicationData.localSettings

        return localSettings
    },

    readLocalSetting: function (key) {
        return this.getLocalSettings().values[key]
    },

    writeLocalSetting: function (key, value) {
        var applicationData = Windows.Storage.ApplicationData.current
          , localSettings = applicationData.localSettings

        localSettings.values[key] = value
    }
}
