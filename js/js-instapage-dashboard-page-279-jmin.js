var InstapageDashboardPage = function (a) {
    this.id = a.page.id;
    this.url = a.page.url;
    this.user = a.page.user;
    this.template = a.page.template;
    this.version = a.page.version;
    this.deleted = a.page.deleted;
    this.title = a.page.title;
    this.created = a.page.created;
    this.page1 = a.page.page1;
    this.updated = a.page.updated;
    this.published_version = a.page.published_version;
    this.plug = a.page.plug;
    this.mailchimplist = a.page.mailchimplist;
    this.mailchimpoption = a.page.mailchimpoption;
    this.configuration = a.page.configuration;
    this.has_thumbnails = a.page.has_thumbnails;
    this.active_page = a.page.active_page;
    this.validate_custom_domain = a.page.validate_custom_domain;
    this.short_title = a.page.short_title;
    this.url_escaped = a.page.url_escaped;
    this.status = a.page.status;
    this.dom = false;
    this.page_group = false;
    var b = this;
    this.__construct = function () {};
    this.appendControls = function () {
        this.dom.find(".options").click(function () {
            b.dom.find(".page_options .more_dropdown_menu").toggle()
        });
        this.dom.find(".change-name-button").click(function () {
            b.changePageNameForm();
            b.dom.find(".more_dropdown_menu").hide()
        });
        this.dom.find(".rename-page-button-done").click(function () {
            b.changePageNameDone();
            return false
        });
        this.dom.find(".change-group").click(function () {
            b.dom.find(".more_dropdown_menu").hide();
            b.changeGroupForm()
        });
        this.dom.find(".delete-page-button").click(function () {
            b.dom.find(".page_item_inner.delete").show();
            b.dom.find(".page_item_inner.normal").hide();
            b.dom.find(".page_item_inner.delete").animate({
                backgroundColor: "#fffdc6"
            }, 400);
            b.dom.find(".page_item_inner.delete").animate({
                backgroundColor: "#fff"
            }, 400)
        });
        this.dom.find(".page_item_inner.delete .button_no").click(function () {
            b.dom.find(".page_item_inner.delete").hide();
            b.dom.find(".page_item_inner.normal").show();
            return false
        });
        this.dom.find(".page_item_inner.delete .button_yes").click(function () {
            b.deletePage();
            return false
        });
        this.dom.find(".page_item_inner.clone .button_no").click(function () {
            if (_Application.user.pay_per_page && !b.page1) {
                b.cloneNoVariants()
            } else {
                b.cloneWithVariants()
            }
        });
        this.dom.find(".page_item_inner.clone .button_yes").click(function () {
            if (_Application.user.pay_per_page && !b.page1) {
                b.dom.find(".page_item_inner.clone").hide();
                b.dom.find(".page_item_inner.normal").show();
                b.dom.find(".more_dropdown_menu").hide();
                b.cloneWithVariants()
            } else {
                _Application.showUpgradePlans(b.id, "/dashboard")
            }
        });
        this.dom.find(".duplicate-button").click(function () {
            b.confirmDuplicate()
        });
        this.dom.find(".select_group .dropdown").click(function () {
            b.toggleSelectGroupMenu()
        });
        this.dom.find(".btn_edit_page").click(function () {
            if (b.page1) {
                window.location = "/builder?id=" + b.id
            } else {
                window.location = "/builder2?id=" + b.id
            }
        });
        this.dom.find(".share-page-button").click(function () {
            b.dom.find(".page_item_inner.share").show();
            b.dom.find(".page_item_inner.normal").hide()
        });
        this.dom.find(".share_ok").click(function () {
            b.dom.find(".page_item_inner.share").hide();
            b.dom.find(".page_item_inner.normal").normal()
        });
        this.dom.find(".select_group").hoverIntent(function () {}, function () {
            $(this).hide();
            b.dom.find(".more_dropdown_menu").hide();
            b.dom.find(".dashboard_controls.page_options").show()
        });
        this.dom.find(".select_group .new-group").click(function () {
            window.location = "#new-group";
            _Application.createGroupFormStart(function (c) {
                b.changePageGroup(c)
            })
        })
    };
    this.changeGroupForm = function () {
        this.toggleSelectGroupMenu();
        this.dom.find(".dashboard_controls").hide();
        this.dom.find(".select_group").show()
    };
    this.changePageGroup = function (f) {
        var e = _Application.getGroup(f);
        if (e) {
            var c = this.getGroup();
            if (c) {
                for (var d = 0; d < c.pages.length; d++) {
                    if (c.pages[d] && c.pages[d] == this.id) {
                        delete(c.pages[d])
                    }
                }
                c.dom.find(".pages-in-group").hide();
                c.updateInfo()
            }
            e.pages.push(this.id);
            this.dom.slideUp(400, function () {
                e.dom.find(".pages-in-group").prepend(b.dom);
                e.updateInfo();
                e.saveMovePage(b);
                b.page_group = e;
                setTimeout(function () {
                    b.dom.slideDown()
                }, 100)
            })
        }
        this.dom.find(".dashboard_controls").show();
        this.dom.find(".select_group").hide();
        this.dom.find(".more_dropdown_menu").hide()
    };
    this.changePageNameDone = function () {
        this.dom.find(".page_item_inner.rename").hide();
        this.dom.find(".page_item_inner.normal").show();
        this.dom.find(".more_dropdown_menu").hide();
        var c = this.dom.find('input[name="new-page-name"]').val();
        this.title = c;
        $.ajax({
            url: "/ajax/dashboard/change_page_name",
            type: "POST",
            data: {
                page_id: b.id,
                name: c
            },
            jsonp: true
        });
        if (c.length > 22) {
            c = c.substring(0, 22) + "..."
        }
        this.dom.find(".page_name").html(c);
        return false
    };
    this.changePageNameForm = function () {
        this.dom.find(".page_item_inner.rename").show();
        this.dom.find(".page_item_inner.normal").hide();
        b.dom.find('.page_item_inner.rename input[type="text"]').focus().focusout(function () {
            b.changePageNameDone()
        })
    };
    this.cloneNoVariants = function () {
        $.ajax({
            url: "/ajax/builder2/clone_no_variants/" + this.id,
            type: "GET",
            dataType: "json",
            success: function (c) {
                window.location = "/dashboard"
            }
        })
    };
    this.cloneWithVariants = function () {
        $.ajax({
            url: "/ajax/builder2/get_page_details/" + b.id,
            type: "GET",
            dataType: "json",
            success: function (c) {
                if (!c) {
                    alert("Error cloning page")
                } else {
                    if (c.error) {
                        alert(c.error_message)
                    } else {
                        var d = c.data.variants_count;
                        if (d > 1) {
                            $.ajax({
                                url: "/ajax/builder2/clone_no_variants/" + b.id,
                                type: "GET",
                                dataType: "json",
                                success: function (e) {
                                    if (!e) {
                                        alert("Error cloning page")
                                    } else {
                                        if (e.error) {
                                            alert(e.error_message)
                                        } else {
                                            payPerPageDialog("clone_page_with_variations", {
                                                page: e.data.page_id,
                                                quantity: d
                                            }, function () {
                                                $.ajax({
                                                    url: "/ajax/builder2/copy_all_contents/" + b.id + "/" + e.data.page_id,
                                                    type: "GET",
                                                    dataType: "json",
                                                    success: function (f) {
                                                        window.location = "/dashboard"
                                                    }
                                                })
                                            }, function () {
                                                $.ajax({
                                                    url: "/ajax/builder2/delete/" + e.data.page_id + "/true",
                                                    type: "GET",
                                                    dataType: "json",
                                                    success: function (f) {
                                                        window.location = "/dashboard"
                                                    }
                                                })
                                            })
                                        }
                                    }
                                }
                            })
                        } else {
                            b.cloneNoVariants()
                        }
                    }
                }
            }
        })
    };
    this.confirmDuplicate = function () {
        if (_Application.user.pay_per_page) {
            $.ajax({
                url: "/ajax/builder2/get_page_details/" + b.id,
                type: "GET",
                dataType: "json",
                success: function (c) {
                    if (!c) {
                        alert("Error cloning page")
                    } else {
                        if (c.error) {
                            alert(c.error_message)
                        } else {
                            if (c.data.variants_count <= 1) {
                                b.duplicatePage()
                            } else {
                                b.dom.find(".page_item_inner.clone").show();
                                b.dom.find(".page_item_inner.normal").hide();
                                b.dom.find(".page_item_inner.clone").animate({
                                    backgroundColor: "#fffdc6"
                                }, 400);
                                b.dom.find(".page_item_inner.clone").animate({
                                    backgroundColor: "#fff"
                                }, 400);
                                return false
                            }
                        }
                    }
                }
            })
        } else {
            if (_Application.user.pages_total >= _Application.user.pages_limit && _Application.user.pages_total != 0 && _Application.user.pages_limit != -1) {
                $("#page_" + id + " .page_item_inner.clone").show();
                $("#page_" + id + " .page_item_inner.normal").hide();
                $("#page_" + id + " .page_item_inner.clone").animate({
                    backgroundColor: "#fffdc6"
                }, 400);
                $("#page_" + id + " .page_item_inner.clone").animate({
                    backgroundColor: "#fff"
                }, 400);
                $("#page_" + id + " .page_item_inner.clone").animate({
                    backgroundColor: "#fffdc6"
                }, 400);
                $("#page_" + id + " .page_item_inner.clone").animate({
                    backgroundColor: "#fff"
                }, 400);
                $("#page_" + id + " .page_item_inner.clone").animate({
                    backgroundColor: "#fffdc6"
                }, 400);
                return false
            } else {
                b.duplicatePage()
            }
        }
    };
    this.deletePage = function () {
        $.ajax({
            url: "/api/pagebuilder/" + b.id + "/delete",
            type: "POST",
            data: {},
            dataType: "json",
            success: function (d, e) {
                if (e.error) {
                    lightbox_open(d, e)
                } else {
                    var f = b.getGroup();
                    if (f) {
                        for (var c = 0; c < f.pages.length; c++) {
                            if (f.pages[c] && f.pages[c] == b.id) {
                                delete(f.pages[c])
                            }
                        }
                        f.updateInfo()
                    }
                    _Application.user.pages_total--;
                    b.dom.remove();
                    delete(b)
                }
            },
            close_callback: reload_page
        })
    };
    this.duplicatePage = function () {
        do_withou_box({
            title: "Cloning Page",
            url: "/ajax/dashboard/clone-page/" + b.id,
            type: "POST",
            jsonp: false,
            callback: function (d, c) {
                if (c.error) {
                    d.content = data.error_message;
                    lightbox_open(d, c.data)
                } else {
                    var f = b.getGroup();
                    if (f) {
                        f.pages.push(c.data.new_page.id)
                    }
                    var e = null;
                    e = _Application.addPage(c.data.new_page, function () {
                        if (f) {
                            f.updateInfo();
                            f.saveMovePage(e);
                            b.page_group = f;
                            f.dom.find(".pages-in-group").prepend(b.dom)
                        }
                    })
                }
            }
        })
    };
    this.getGroup = function () {
        if (this.page_group === false) {
            this.page_group = _Application.getPageGroupByPage(this)
        }
        return this.page_group
    };
    this.render = function (c) {
        this.dom = $("#dashboardPageItem").tmpl({
            page: this,
            user: _Application.user
        });
        this.appendControls();
        setTimeout(function () {
            hoverTips(this.dom)
        }, 100);
        return this.dom
    };
    this.toggleSelectGroupMenu = function () {
        if (b.dom.find(".select_group .ip_select_dropdown.more_dropdown_menu").is(":visible")) {
            b.dom.find(".select_group .ip_select_dropdown.more_dropdown_menu").hide()
        } else {
            b.dom.find(".select_group .page-group-list .page-group").remove();
            for (var c = 0; c < _Application.page_groups.length; c++) {
                if (_Application.page_groups[c]) {
                    var e = $("<span>").html(_Application.page_groups[c].name);
                    var d = $("<li>").html(e).attr("group-id", _Application.page_groups[c].id).addClass("page-group");
                    $(d).click(function () {
                        b.changePageGroup($(this).attr("group-id"))
                    });
                    b.dom.find(".select_group .page-group-list .new-group").before(d)
                }
            }
            b.dom.find(".select_group .ip_select_dropdown.more_dropdown_menu").show()
        }
    };
    this.__construct()
};