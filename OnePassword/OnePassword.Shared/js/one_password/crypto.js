OnePassword.Crypto = {
    Sha1: {
        hash: function (s) {
            var Cryptography = Windows.Security.Cryptography

            var utf8 = Cryptography.BinaryStringEncoding.utf8
              , utf8Message = Cryptography.CryptographicBuffer.convertStringToBinary(s, utf8)
              , provider = Cryptography.Core.HashAlgorithmProvider.openAlgorithm(Cryptography.Core.HashAlgorithmNames.sha1)
              , hash = provider.hashData(utf8Message)
              , strHash = Cryptography.CryptographicBuffer.encodeToBase64String(hash)

            return strHash
        }
    }
}