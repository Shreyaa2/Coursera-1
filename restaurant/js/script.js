$(function() {
    $("#navbarToggle").blur(function(event) {
        var screenwidth = window.innerWidth;
        if (screenwidth < 768) {
            $("#collapsable").collapse('hide');
        }
    });

    $("#navbarToggle").click(function(event) {
        $(event.target).focus();
    });
});



(function(global) {

    var sb = {};

    var homepage = "snippets/home.html";
    var allCategoriesUrl =
        "https://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml = "snippets/category-title.html";
    var categoryHtml = "snippets/category-tiles.html";
    var menuItemsUrl =
        "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml = "snippets/menu-titles.html";
    var menuItemHtml = "snippets/menu-items.html";


    var insertHTML = function(selector, html) {
        var targetHtml = document.querySelector(selector);
        targetHtml.innerHTML = html;
    };

    var showloading = function(selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHTML(selector, html);
    };


    var insertProperty = function(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string
            .replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    }

    document.addEventListener("DOMContentLoaded", function(event) {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(
            homepage,
            function(responseText) {
                document.querySelector("#main-content").innerHTML = responseText;
            },
            false);
    });



    sb.loadMenuCategories = function() {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl,
            buildAndShowCategoriesHTML);
    };

    sb.loadMenuItems = function(categoryShort) {
        showloading("#main-content");
        $ajaxUtils.sendGetRequest(
            menuItemsUrl + categoryShort,
            buildAndShowMenuItemsHTML);
    };




    // Builds HTML for the categories page based on the data
    // from the server
    function buildAndShowCategoriesHTML(categories) {
        // Load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml,
            function(categoriesTitleHtml) {
                // Retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHtml,
                    function(categoryHtml) {
                        var categoriesViewHtml =
                            buildCategoriesViewHtml(categories,
                                categoriesTitleHtml,
                                categoryHtml);
                        insertHTML("#main-content", categoriesViewHtml);
                    },
                    false);
            },
            false);
    }


    // Using categories data and snippets html
    // build categories view HTML to be inserted into page
    function buildCategoriesViewHtml(categories,
        categoriesTitleHtml,
        categoryHtml) {

        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over categories
        for (var i = 0; i < categories.length; i++) {
            // Insert category values
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html =
                insertProperty(html, "name", name);
            html =
                insertProperty(html,
                    "short_name",
                    short_name);
            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        // Load title snippet of menu items page
        $ajaxUtils.sendGetRequest(
            menuItemsTitleHtml,
            function(menuItemsTitleHtml) {
                // Retrieve single menu item snippet
                $ajaxUtils.sendGetRequest(
                    menuItemHtml,
                    function(menuItemHtml) {
                        var menuItemsViewHtml =
                            buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml);
                        insertHTML("#main-content", menuItemsViewHtml);
                    },
                    false);
            },
            false);
    }

    function buildMenuItemsViewHtml(categoryMenuItems,
        menuItemsTitleHtml,
        menuItemHtml) {

        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "name",
                categoryMenuItems.category.name);
        menuItemsTitleHtml =
            insertProperty(menuItemsTitleHtml,
                "special_instructions",
                categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            // Insert menu item values
            var html = menuItemHtml;
            html =
                insertProperty(html, "short_name", menuItems[i].short_name);
            html =
                insertProperty(html,
                    "catShortName",
                    catShortName);
            html =
                insertItemPrice(html,
                    "price_small",
                    menuItems[i].price_small);
            html =
                insertItemPortionName(html,
                    "small_portion_name",
                    menuItems[i].small_portion_name);
            html =
                insertItemPrice(html,
                    "price_large",
                    menuItems[i].price_large);
            html =
                insertItemPortionName(html,
                    "large_portion_name",
                    menuItems[i].large_portion_name);
            html =
                insertProperty(html,
                    "name",
                    menuItems[i].name);
            html =
                insertProperty(html,
                    "description",
                    menuItems[i].description);

            // Add clearfix after every second menu item
            if (i % 2 != 0) {
                html +=
                    "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }



    // Appends price with '$' if price exists
    function insertItemPrice(html,
        pricePropName,
        priceValue) {
        // If not specified, replace with empty string
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");;
        }

        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }


    // Appends portion name in parens if it exists
    function insertItemPortionName(html,
        portionPropName,
        portionValue) {
        // If not specified, return original string
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }

        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    global.$sb = sb;

})(window);