// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var openItem = function (e) {
        e.preventDefault()

        var item = this.lists.filteredList.getAt(e.detail.itemIndex)

        WinJS.Navigation.navigate('/pages/items/show.html', {
            item: item
        })
    }

    WinJS.UI.Pages.define("/pages/items/index.html", {
        ready: function (element, options) {
            this.options = options
            this.originalItems = this.items = options.items

            openItem = openItem.bind(this)

            if (this.items) {
                this.populateData(element)
                this.applyListView(element)
                this.observeSearchField(element)
            }
        },

        populateData: function (element) {
            var $query = WinJS.Utilities.query('[name="query"]')[0]
            var queryString = $query.value.toLowerCase()
            var dataList = new WinJS.Binding.List(this.items)
            var filteredList = dataList.createFiltered(function (item) {
                return (item.name.toLowerCase().indexOf(queryString) > -1)
            })
            var getItemTitle = function (item) {
                var title = item.name.toUpperCase().charAt(0)

                if (parseInt(title).toString() === title) {
                    title = '#'
                }

                return title
            }
            var groupedList = filteredList.createGrouped(
                getItemTitle,
                function (item) {
                    var groupTitle = getItemTitle(item)

                    return {
                        title: groupTitle,
                        itemCount: filteredList.filter(function (item) { return getItemTitle(item) === groupTitle }).length
                    }
                },
                function (a, b) { return a.charCodeAt(0) - b.charCodeAt(0) }
            )

            this.lists = { itemList: dataList, filteredList: filteredList, groupedList: groupedList }
        },

        applyListView: function (element) {
            var listView = WinJS.Utilities.query("#itemListView", element)[0]

            if (listView) {
                var $listView = WinJS.Utilities.query("#itemListView", element)[0].winControl

                $listView.layout = { type: WinJS.UI.ListLayout }
                $listView.itemDataSource = this.lists.groupedList.dataSource
                $listView.groupDataSource = this.lists.groupedList.groups.dataSource
                $listView.itemTemplate = WinJS.Utilities.query("#itemTemplate", element)[0]
                $listView.groupHeaderTemplate = WinJS.Utilities.query('#itemHeaderTemplate', element)[0]

                $listView.removeEventListener("iteminvoked", openItem)
                $listView.addEventListener("iteminvoked", openItem)
            }
        },

        observeSearchField: function (element) {
            var timeoutIndex = null
            var $query = WinJS.Utilities.query('[name="query"]')[0]
            var fun = function () {
                timeoutIndex = null
                this.populateData(element)
                this.applyListView(element)
            }.bind(this)

            $query.addEventListener('keyup', function () {
                if (timeoutIndex !== null) {
                    window.clearTimeout(timeoutIndex)
                }

                timeoutIndex = window.setTimeout(fun, 50)
            })
        },

        openItem: function (e) {
            e.preventDefault()

            console.log(e)

            var item = this.lists.filteredList.getAt(e.detail.itemIndex)

            WinJS.Navigation.navigate('/pages/items/show.html', {
                item: item
            })
        }
    });
})();
