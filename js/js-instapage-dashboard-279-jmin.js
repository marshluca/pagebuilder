var InstapageDashboard = function (a) {
    this.options = a;
    this.dom = $("#dashboard_main");
    var b = this;
    this.__construct = function () {
        this.load(function (d, c, e) {
            b.render(d, c, e, function () {
                b.appendControls();
                if (b.user.email.length < 1) {
                    b.showMissingEmailForm()
                }
            })
        })
    };
    this.addDeletedPage = function (d) {
        var c = $("#dashboardDeletedPage").tmpl(d);
        $(c).find(".undo").click(function () {
            _Application.undeletePage(parseInt($(this).parent().attr("page-id")));
            return false
        });
        this.dom.find(".deleted-pages").prepend($(c))
    };
    this.addPage = function (c, f) {
        if (!this.pages) {
            this.pages = []
        }
        var d = this.getPageGroupByPage(c);
        var e = new InstapageDashboardPage({
            page: c
        });
        if (!d) {
            this.dom.find(".ungrupped-pages").append(e.render())
        } else {
            d.dom.find(".pages-in-group").append(e.render())
        }
        this.pages.push(e);
        if (f && typeof (f) == "function") {
            setTimeout(function () {
                f()
            }, 100)
        }
        return e
    };
    this.addPageGroup = function (c, e) {
        if (!this.page_groups) {
            this.page_groups = []
        }
        var d = new InstapageDashboardPageGroup({
            page_group: c
        });
        d.render();
        b.dom.find(".page-groups").append(d.dom);
        this.page_groups.push(d);
        setTimeout(function () {
            d.appendControls();
            if (typeof (e) == "function") {
                e()
            }
        }, 100);
        return d
    };
    this.addPageToGroup = function (d, e) {
        for (var c = 0; c < this.page_groups.length; c++) {
            if (this.page_groups[c] && this.page_groups[c].id == d) {
                this.page_groups[c].pages.push(e.id)
            }
        }
    };
    this.appendControls = function () {
        $(".new-group-button").click(function () {
            if (b.dom.find(".create-group").is(":visible")) {
                b.dom.find(".create-group").slideUp()
            } else {
                b.createGroupFormStart(false)
            }
        })
    };
    this.createGroupFormEnd = function (e) {
        var d = this.dom.find('.create-group input[name="group-name"]').val();
        if (d.length > 0 && !this.doesGroupExist()) {
            this.dom.find(".create-group").slideUp(400, function () {
                b.dom.find(".create-group").html("")
            });
            var c = {
                name: d
            };
            $.ajax({
                url: "/ajax/configuration/user-add-page-group",
                type: "post",
                dataType: "json",
                data: {
                    new_group: d
                },
                success: function (f) {
                    if (f && f.success) {
                        c.id = parseInt(f.data.id);
                        c.pages_count = 0;
                        c.published_pages_count = 0;
                        c.pages = [];
                        b.addPageGroup(c, function () {
                            if (typeof (e) == "function") {
                                e(c.id)
                            }
                        })
                    }
                }
            })
        }
    };
    this.createGroupFormStart = function (d) {
        var c = $("#createGroupForm").tmpl({});
        $(c).find('input[name="group-name"]').val("");
        this.dom.find(".create-group").html("").append(c);
        this.dom.find(".create-group").slideDown(400, function () {
            b.dom.find(".create-group .create-group-button").click(function () {
                b.createGroupFormEnd(d);
                return false
            })
        })
    };
    this.deleteGroup = function (f, g) {
        var c = this.getGroupPages(f.id);
        if (c) {
            for (var d = 0; d < c.length; d++) {
                var e = this.getPageById(c[d]);
                if (e) {
                    e.dom.hide();
                    this.dom.find(".ungrupped-pages").prepend(e.dom);
                    e.dom.slideDown()
                }
            }
        }
        $.ajax({
            url: "/ajax/configuration/user-delete-page-group",
            type: "post",
            dataType: "json",
            data: {
                id: f.id
            },
            success: function (h) {}
        });
        for (var d = 0; d < this.page_groups.length; d++) {
            if (this.page_groups[d] && this.page_groups[d].id == f.id) {
                this.page_groups[d].dom.remove();
                delete(this.page_groups[d])
            }
        }
    };
    this.doesGroupExist = function (d) {
        if (!this.page_groups) {
            return false
        }
        for (var c = 0; c < this.page_groups.length; c++) {
            if (this.page_groups[c] && this.page_groups[c].name == d) {
                return true
            }
        }
        return false
    };
    this.getGroupPages = function (e) {
        var c = [];
        for (var d = 0; d < this.page_groups.length; d++) {
            if (this.page_groups[d] && this.page_groups[d].id == e) {
                if (this.page_groups[d] && this.page_groups[d].pages) {
                    c = this.page_groups[d].pages
                }
            }
        }
        return c
    };
    this.getGroup = function (d) {
        for (var c = 0; c < this.page_groups.length; c++) {
            if (this.page_groups[c] && this.page_groups[c].id == d) {
                return this.page_groups[c]
            }
        }
    };
    this.getPageById = function (c) {
        for (var d = 0; d < this.pages.length; d++) {
            if (this.pages[d] && this.pages[d].id == c) {
                return this.pages[d]
            }
        }
    };
    this.getPageGroupByPage = function (e) {
        if (!this.page_groups) {
            return false
        }
        for (var d = 0; d < this.page_groups.length; d++) {
            if (this.page_groups[d] && this.page_groups[d].pages && this.page_groups[d].pages.length > 0) {
                for (var c = 0; c < this.page_groups[d].pages.length; c++) {
                    if (this.page_groups[d].pages[c] == e.id) {
                        return this.page_groups[d]
                    }
                }
            }
        }
        return null
    };
    this.load = function (c) {
        $.ajax({
            // url: "/ajax/dashboard/get-user-data",
			url: "/builder/json/get-user-data.json",
            type: "GET",
            dataType: "json",
            success: function (d) {
                if (d && d.success && d.data) {                    
                    b.user = d.data.user;
                    b.dom.find(".loading-dashboard").fadeOut();
                    if (typeof (c) == "function") {                        
                        c(d.data.page_groups, d.data.pages, d.data.deleted_pages)
                    }
                }
            }
        })
    };
    this.render = function (d, c, f, g) {
        if (d) {
            for (var e = 0; e < d.length; e++) {
                if (d[e]) {
                    this.addPageGroup(d[e])
                }
            }
        }
        if (c) {
            for (var e = 0; e < c.length; e++) {
                if (c[e]) {
                    this.addPage(c[e])
                }
            }
        }
        if (f) {
            for (var e = 0; e < f.length; e++) {
                if (f[e]) {
                    this.addDeletedPage(f[e])
                }
            }
        }
        if (this.page_groups) {
            for (var e = 0; e < this.page_groups.length; e++) {
                this.page_groups[e].updateInfo()
            }
        }
        if (typeof (g) == "function") {
            setTimeout(function () {
                g()
            }, 100)
        }
    };
    this.showUpgradePlans = function (d, c, f) {
        var e = this.getPageById(d);
        e.dom.find(".page_item_inner.clone").hide();
        e.dom.find(".page_item_inner.normal").show();
        e.dom.find(".more_dropdown_menu").hide();
        showPlans(c, f);
        return false
    };
    this.showMissingEmailForm = function () {
        var c = $("#missingEmailForm").tmpl();
        new DarkYesNoDialog("Please add your email to confirm", $(c), function () {
            $(c).find("form").submit()
        }, "GO", function () {})
    };
    this.undeletePage = function (c) {
        if (this.user.pay_per_page) {
            document.location = "/dashboard/undelete/" + c
        } else {
            $.ajax({
                url: "/api/subscription/info",
                dataType: "json",
                success: function (d) {
                    if (d.response && (d.response.getPagesLeft > 0 || d.response.pages_limit == -1)) {
                        document.location = "/dashboard/undelete/" + c
                    } else {
                        new DarkYesNoDialog("You have reached your pages limit.", "<p>Your current plan allows " + d.response.pages_limit + " page. You will need upgrade your subscription to undelete this page or delete any existing page.</p>", function () {
                            showPlans("/dashboard/undelete/" + c)
                        }, "Upgrade", function () {}, "Cancel")
                    }
                }
            })
        }
    };
    this.__construct()
};
do_withou_box = function (c) {
    var b = {
        title: "",
        footer: "",
        content: false,
        url: false,
        type: "GET",
        class_name: "full_lb",
        data: {},
        jsonp: false,
        callback: false,
        close_callback: false,
        close: default_close
    };
    $.extend(b, c);
    if (b.url) {
        var a = "json";
        if (b.jsonp) {
            a = "jsonp"
        }
        $.ajax({
            url: b.url,
            success: function (e, f) {
                if (!e) {
                    return
                }
                if (e.errno != undefined && e.errno == "401") {
                    ajax_signin();
                    return
                }
                var d = {
                    title: $("#jlightbox #lb_header"),
                    content: $("#jlightbox #lb_content")
                };
                if (b.callback) {
                    b.callback(d, e)
                } else {
                    lightbox_open(d, e)
                }
                $("#jlightbox").css({
                    marginTop: "-" + ($("#jlightbox").outerHeight() / 2) + "px"
                })
            },
            error: function (e, d) {
                alert($.toJSON(e) + "/" + $.toJSON(d))
            },
            type: b.type,
            dataType: a,
            data: b.data
        })
    }
};

function popitup(b, g) {
    var c = 500;
    var a = 300;
    var e = (screen.width - c) / 2;
    var d = (screen.height - a) / 2;
    var f = "width=" + c + ", height=" + a;
    f += ", top=" + d + ", left=" + e;
    var h = window.open(b, g, f);
    if (window.focus) {
        h.focus()
    }
    return false
};