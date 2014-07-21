(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            this.password = OnePassword.Helpers.OnePassword.getPassword()

            if (!!this.password) {
                this.loadItems(element, function (items) {
                    if (items) {
                        this.items = items
                        this.populateData(element)
                        this.applyListView(element)
                    }
                }.bind(this))
            } else {
                WinJS.Navigation.navigate('/pages/misc/master_password.html')
            }

            
        },

        loadItems: function (element, callback) {
            var $progress = WinJS.Utilities.query('progress', element)[0]
            var $subHeadline = WinJS.Utilities.query('.titlearea small')[0]
            var self = this

            OnePassword.Helpers.OnePassword.readItems(null, {
                onProgress: function (current, max) {
                    $progress.value = current
                    $progress.max = max
                },

                onSuccess: function (items) {
                    $progress.value = $progress.max

                    items = items.filter(function (item) {
                        // remove empty elements
                        return item.name.trim() !== ''
                    }).sort(function (a, b) {
                        // sort them by name
                        return (a.name.toLowerCase()[0] > b.name.toLowerCase()[0]) ? 1 : -1
                    })

                    setTimeout(function () {
                        $subHeadline.innerHTML = '<i class="fa fa-angle-right"></i>&nbsp; Unlocking database'

                        OnePassword.Helpers.OnePassword._database.unlock(self.password)

                        setTimeout(function () {
                            $progress.removeNode(false)
                            $subHeadline.innerHTML = '<i class="fa fa-angle-right"></i>&nbsp; Category selection'
                            callback(items)
                        }, 500)
                    }, 500)
                }
            })
        },

        populateData: function (element) {
            // Will be { category1: itemCount, category2: itemCount }
            var groupedDataHash = this.items.reduce(function (acc, item) {
                var key = item.type
                acc[key] = !!acc[key] ? acc[key] + 1 : 1
                return acc
            }, {})

            groupedDataHash.all = this.items.length

            // Will be [{displayName: 'Category 1 name', name: 'internal name', itemCount: itemCount}]
            var groupedDataArray = Object.keys(groupedDataHash).map(function (key) {
                return {
                    displayName: OnePassword.Helpers.t("categories." + key),
                    name: key,
                    itemCount: groupedDataHash[key],
                    icon: this.getIconForCategoryName(key)
                }
            }.bind(this)).sort(function (a, b) {
                return b.itemCount - a.itemCount
            })

            this.list = new WinJS.Binding.List(groupedDataArray)
        },

        getIconForCategoryName: function (categoryName) {
            return ({
                "webforms.WebForm": "ion-unlocked",
                "wallet.computer.License": "ion-ios7-monitor",
                "passwords.Password": "ion-key",
                "securenotes.SecureNote": "ion-document-text",
                "system.folder.Regular": "ion-folder",
                "wallet.financial.BankAccountUS": "ion-cash",
                "wallet.financial.CreditCard": "ion-card"
            }[categoryName] || "ion-ios7-box")
        },

        applyListView: function (element) {
            var $listView = WinJS.Utilities.query("#categoryListView", element)[0].winControl

            $listView.layout = { type: WinJS.UI.ListLayout }
            $listView.itemDataSource = this.list.dataSource
            $listView.itemTemplate = WinJS.Utilities.query("#categoryTemplate", element)[0]
            $listView.addEventListener("iteminvoked", this.openCategory.bind(this))
        },

        openCategory: function (e) {
            e.preventDefault()

            var categoryName = this.list.getAt(e.detail.itemIndex).name
              , items = this.items

            if (categoryName !== 'all') {
                items = items.filter(function (item) {
                    return item.type === categoryName
                })
            }

            WinJS.Navigation.navigate('/pages/items/index.html', {
                items: items,
                category: categoryName
            })
        }
    });
})();
