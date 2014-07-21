﻿// Generated by CoffeeScript 1.6.1
(function () {
    var Database, readJSONFile;

    readJSONFile = function (dataStorage, path) {
        try {
            var content = dataStorage[path]
            return JSON.parse(content)
        } catch (e) {
            return null
        }
    };

    Database = (function () {

        function Database(dataStorage) {
            var contentsData, encryptionKeysData, expandPath, fetcher;
            expandPath = function (baseName) {
                return 'data/default/' + baseName;
            };
            encryptionKeysData = readJSONFile(dataStorage, expandPath('encryptionKeys.js'));
            this.encryptionKeys = new OnePassword.EncryptionKeys(encryptionKeysData);
            contentsData = readJSONFile(dataStorage, expandPath('contents.js'));
            fetcher = function (uuid) {
                return readJSONFile(dataStorage, expandPath(uuid + '.1password'));
            };
            this.contents = new OnePassword.Contents(contentsData, fetcher);
        }

        Database.prototype.unlock = function (password) {
            return this.encryptionKeys.unlock(password);
        };

        Database.prototype.locked = function () {
            return this.encryptionKeys.locked();
        };

        Database.prototype.search = function (query) {
            var item, items, key, securityLevel, _i, _len;
            items = this.contents.search(query);
            return items;
        };

        return Database;

    })();

    OnePassword.Database = Database

}).call(this);