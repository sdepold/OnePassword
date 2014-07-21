OnePassword.Helpers.OnePassword = {
    readCacheItem: function (path) {
        return this._cache[path]
    },

    readItems: function (needle, options) {
        this._getDatabase(function (database) {
            options.onSuccess && options.onSuccess(database ? database.search(needle) : null)
        }, options.onProgress)
    },

    findItem: function (uuid, callback, progressHandler) {
        this._getDatabase(function (database) {
            var items = database.contents.items.filter(function (item) {
                return item.uuid === uuid
            })
            callback(items[0])
        }, progressHandler)
    },

    sync: function (callback, options) {
        var self = this

        if (OnePassword.Helpers.Dropbox.getClient().isAuthenticated()) {
            this._fillCache(function () {
                self._writePersistantCache(function () {
                    self._clearCache()
                    callback && callback()
                })
            }, options)
        } else {
            OnePassword.Helpers.Dropbox.auth(function () {
                self.sync(callback)
            })
        }
    },

    hasCache: function (callback) {
        if (!callback) {
            return
        }

        this._getCacheFolder(false, function (folder) {
            folder.getFilesAsync().done(function (files) {
                files = files.map(function (file) { return file.name })
                callback((files.length > 1) && (files.indexOf('encryptionKeys.js') > -1))
            })
        })
    },

    getPassword: function () {
        return OnePassword.Helpers.readLocalSetting('onepassword_password')
    },

    setPassword: function (password, keep) {
        var expirationDate = keep ? (Date.now() + 1000 * 60 * 60 * 24) : Date.now()

        OnePassword.Helpers.writeLocalSetting('onepassword_password', password)
        OnePassword.Helpers.writeLocalSetting('onepassword_expiration_date', expirationDate)
    },

    expirePassword: function () {
        OnePassword.Helpers.writeLocalSetting('onepassword_password', null)
        OnePassword.Helpers.writeLocalSetting('onepassword_expiration_date', null)
    },

    checkPasswordExpiration: function () {
        var expirationDate = OnePassword.Helpers.readLocalSetting('onepassword_expiration_date')

        if (expirationDate && (expirationDate < Date.now())) {
            this.expirePassword()
        }
    },

    _cache: {},
    _database: null,

    _getDatabase: function (callback, progressHandler) {
        var self = this

        if (this._database) {
            callback(this._database)
        } else {
            this._getPersistantCache(function (cache) {
                if (Object.keys(cache).length === 0) {
                    callback(null)
                } else {
                    if (!cache['data/default/encryptionKeys.js']) {
                        callback(null)
                    } else {
                        self._database = new OnePassword.Database(cache)
                        callback(self._database)
                    }
                }
            }, progressHandler)
        }
    },

    _getLocalFolder: function () {
        var applicationData = Windows.Storage.ApplicationData.current
          , localFolder = applicationData.localFolder

        return localFolder
    },

    _getCacheFolder: function (replaceExisting, callback) {
        var collisionOption = replaceExisting ? Windows.Storage.CreationCollisionOption.replaceExisting : Windows.Storage.CreationCollisionOption.openIfExists

        this
            ._getLocalFolder()
            .createFolderAsync('1password', collisionOption)
            .done(callback)
    },

    _writePersistantCache: function (callback) {
        var fileCount = Object.keys(this._cache).length
          , self = this

        this._getCacheFolder(true, function (folder) {
            Object.keys(self._cache).forEach(function (path) {
                folder.createFileAsync(path.replace('data/default/', '')).done(function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, self._cache[path]).done(function () {
                        fileCount--

                        if (fileCount === 0) {
                            callback()
                        }
                    })
                })
            })
        })
    },

    _getPersistantCache: function (callback, progressHandler) {
        var result = {}
          , encoding = Windows.Storage.Streams.UnicodeEncoding.utf8
          , max = 0

        this._getCacheFolder(false, function (folder) {
            folder.getFilesAsync().done(function (files) {
                if (files.length === 0) {
                    return callback(result)
                }

                max = files.length

                files.forEach(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file, encoding).done(function (content) {
                        result["data/default/" + file.name] = content

                        var current = Object.keys(result).length

                        if (progressHandler) {
                            progressHandler(current, max)
                        }

                        if (current === max) {
                            callback(result)
                        }
                    })
                })
            })
        })
    },

    _findKeyChain: function (callback) {
        var client = OnePassword.Helpers.Dropbox.getClient()

        client.findByName("/", "1Password.agilekeychain", {}, function (error, entries) {
            if (entries && (entries.length > 0)) {
                callback(null, entries[0].path)
            } else {
                callback(new Error('No password file found!'), null)
            }
        });
    },

    _cacheItems: function (path, callback, options) {
        var client = OnePassword.Helpers.Dropbox.getClient()
          , self = this
          , queue = []

        var readItem = function (filePath, callback) {
            var fullPath = "data/default/" + filePath

            client.readFile(path + "/" + fullPath, {}, function (err, content) {
                if (err) {
                    console.log(err)
                    queue.push(filePath)
                } else {
                    self._cache[fullPath] = content
                }

                if (queue.length > 0) {
                    options.onProgress('afterReadItem', queue.length)
                    readItem(queue.shift(), callback)
                } else {
                    callback()
                }
            })
        }

        client.readdir(path + "/data/default/", {}, function (err, entries) {
            queue = entries

            if (queue.length > 0) {
                options.onProgress('afterReaddir', queue.length)
                readItem(queue.shift(), callback)
            } else {
                callback()
            }
        })
    },

    _fillCache: function (callback, options) {
        var self = this

        options = OnePassword.Helpers.extend({
            onProgress: function () { }
        }, options || {})

        options.onProgress('beforeFindKeyChain')

        this._findKeyChain(function (err, keyChainPath) {
            options.onProgress('afterFindKeyChain')
            self._cacheItems(keyChainPath, callback, options)
        })
    },

    _clearCache: function () {
        this._cache = {}
    }
}