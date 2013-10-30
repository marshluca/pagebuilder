var PageBuilder = function (b) {
    this.last_saved_data = null;
    this.analytics_code = null;
    this.background = {};
    this.custom_code = null;
    this.conversions = {};
    this.date = new Date();
    this.font = null;
    this.font_headline = null;
    this.font_paragraph = null;
    this.paused = false;
    this.page_id = b.page_id;
    this.plug = null;
    this.options = b;
    this.seo_description = null;
    this.seo_keywords = null;
    this.seo_title = null;
    this.seo_favicon = null;
    this.undo_redo_stack = [];
    this.undo_redo_iteration = 0;
    this.user_id = b.user_id;
    this.widgets = [];
    this.variation = b.variation;
    this.variations = [];
    this.version = b.page_version;
    this.variation_name = null;
    this.seo_promoted = false;
    var c = this;
    this.application_profile = {};
    this.application_profile.start_time = this.date.getTime();
    this.application_profile.draggable_snap_disabled = b.draggable_snap_disabled !== "undefined" ? b.draggable_snap_disabled : false;
    this.addWidget = function (d) {
        this.widgets.push(d);
        this.updateWidgetFonts();
        return d
    };
    this.bindKeys = function () {
        var d = [46, 110];
        $(document).keyup(function (f) {
            if (f.keyCode === 27) {
                c.deactivateWidgets();
                c.undim()
            }
            if (f.keyCode === d[0] || f.keyCode === d[1]) {
                if (c.getActiveWidget() && !c.getActiveWidget().on_edit) {
                    c.deleteActiveWidget()
                }
                $(".multi-select").each(function () {
                    var e = c.getWidgetById(parseInt($(this).attr("id").replace("element-", "")));
                    if (e) {
                        e.deleteWidget()
                    }
                });
                f.preventDefault();
                f.stopPropagation();
                return false
            }
            if (f.keyCode === 13) {
                if (c.getActiveWidget() && !c.getActiveWidget().on_edit && !c.getActiveWidget().css_editor) {
                    c.getActiveWidget().editStart();
                    return false
                }
            }
            if (f.keyCode === 17) {
                if (c.getActiveWidget() && !c.getActiveWidget().on_edit && !c.getActiveWidget().css_editor) {
                    c.getActiveWidget().editCss();
                    return false
                }
            }
        })
    };
    this.createVariation = function (d, e) {
        d = d !== null && d !== false ? d : this.variation;
        copied_variation = {
            analytics_code: this.variations[d].analytics_code,
            background: this.variations[d].background,
            conversions: this.variations[d].background,
            custom_code: this.variations[d].custom_code,
            elements: this.variations[d].elements,
            font: this.variations[d].font,
            page_blocks: this.variations[d].page_blocks,
            pause_variation: false,
            seo_description: this.variations[d].seo_description,
            seo_keywords: this.variations[d].seo_keywords,
            seo_title: this.variations[d].seo_title,
            seo_favicon: this.variations[d].seo_favicon,
            variation_name: this.generateVariationName()
        };
        this.variations.push(copied_variation);
        this.changeVariation(this.variations.length - 1, e)
    };
    this.changeVariation = function (d, e) {
        if (this.variation != d && this.variations[d]) {
            this.variation = d;
            this.renderPageFromData(this.variations[d]);
            this.resetUndoRedo();
            if (typeof (e) == "function") {
                e()
            }
        }
    };
    this.deactivateWidgets = function (e) {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d] && this.widgets[d].deactivate) {
                    if (e && e.id == this.widgets[d].id) {} else {
                        if (this.widgets[d].isOnEdit()) {
                            this.widgets[d].editDone();
                            this.widgets[d].deactivate()
                        } else {
                            this.widgets[d].deactivate()
                        }
                    }
                }
            }
        }
    };
    this.debug = function (f) {
        if (this.options.debug && console) {
            if (!this.debug_timer) {
                var e = new Date();
                this.debug_timer = e.getTime()
            }
            var e = new Date();
            var d = e.getTime() - this.debug_timer;
            if (console) {
                console.log(d + " " + f)
            }
            this.debug_timer = e.getTime()
        }
    };
    this.deleteActiveWidget = function () {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d] && this.widgets[d].isActive()) {
                    this.widgets[d].deleteWidget()
                }
            }
        }
    };
    this.deleteDraggableSnapHelpers = function () {
        $(".shadow-draggable.").remove()
    };
    this.deleteWidget = function (e) {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d] && this.widgets[d].id == e.id) {
                    delete this.widgets[d]
                }
            }
        }
        this.updateUndoRedo()
    };
    this.deleteVariation = function (d, e) {
        if (this.variation != d) {
            this.variations[d] = {
                deleted: true
            };
            if (typeof (e) == "function") {
                e()
            }
        }
    };
    this.didUseSeo = function () {
        for (var d = 0; d < this.variations.length; d++) {
            if (this.variations[d] && !this.variations[d].deleted) {
                if (this.variations[d].seo_description || this.variations[d].seo_keywords || this.variations[d].seo_title || this.variations[d].seo_favicon) {
                    return true
                }
            }
        }
        return false
    };
    this.dim = function (e) {
        if ($(".dim").length == 0) {
            var d = $("<div></div");
            d.addClass("dim");
            d.html(e);
            $("body").append(d)
        } else {
            $(".dim").show()
        }
    };
    this.doPublish = function () {
        window.onbeforeunload = null;
        window.location = "https://" + location.host + "/builder2/publish/" + this.page_id + "/" + this.version
    };
    this.getActiveWidget = function () {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d] && this.widgets[d].isActive()) {
                    return this.widgets[d]
                }
            }
        }
    };
    this.generateVariationName = function (g) {
        var d = null;
        var e = "";
        var k = null;
        for (var f = 0; f < this.variations.length; f++) {
            if (this.variations[f] && this.variations[f].variation_name) {
                d = this.variations[f].variation_name
            }
        }
        if (!d) {
            return String.fromCharCode(65 + this.variations.length)
        }
        var h = d.charCodeAt(0) - 65;
        for (var f = 1; f < d.length; f++) {
            h *= 26;
            h += (d.charCodeAt(f) - 65)
        }
        h += 1;
        h = Math.abs(h);
        var l = "";
        while (h > 0) {
            var j = (h % 26);
            e = String.fromCharCode(j + 65) + e;
            h = (h - j) / 26
        }
        return e
    };
    this.getMaxZIndex = function () {
        var e = 3;
        for (var d = 0; d < this.widgets.length; d++) {
            if (this.widgets[d] && this.widgets[d].z_index) {
                if (this.widgets[d].z_index > e) {
                    e = this.widgets[d].z_index
                }
            }
        }
        return e
    };
    this.getMultiselectWidgets = function () {
        var e = [];
        for (var d = 0; d < this.widgets.length; d++) {
            if (this.widgets[d].element && $(this.widgets[d].element).hasClass("multi-select")) {
                e.push(this.widgets[d])
            }
        }
        return e
    };
    this.getPageImages = function () {
        hasElement = function (k, l) {
            for (var j = 0; j < k.length; j++) {
                if (k[j].id && k[j].id == l.id) {
                    return true
                } else {
                    if (!k[j].id && k[j].src == l.src) {
                        return true
                    }
                }
            }
            return false
        };
        var d = [];
        for (var f = 0; f < this.variations.length; f++) {
            for (var e = 0; e < this.variations[f].elements.length; e++) {
                if (this.variations[f].elements[e]) {
                    var g = this.variations[f].elements[e];
                    if (g.type == "image") {
                        var h = {
                            src: g.contents.image,
                            alt: g.title,
                            id: g.id
                        };
                        if (!hasElement(d, h)) {
                            d.push(h)
                        }
                    }
                }
            }
        }
        return d
    };
    this.getWidgetById = function (e) {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d] && this.widgets[d].id == e) {
                    return this.widgets[d]
                }
            }
        }
    };
    this.getVariationName = function (d) {
        if (!_Application.variations[d].variation_name) {
            if (_Application.variations[d - 1]) {
                _Application.variations[d].variation_name = String.fromCharCode(_Application.variations[d - 1].variation_name.charCodeAt(0))
            } else {
                _Application.variations[d].variation_name = "A"
            }
        }
        return _Application.variations[d].variation_name
    };
    this.getVariationsCount = function () {
        var e = 0;
        for (var d = 0; d < this.variations.length; d++) {
            if (this.variations[d] && !this.variations[d].deleted) {
                e++
            }
        }
        return e
    };
    this.loadPage = function (d) {
        c.debug("Load page data from server.");
        this.dim();
        $.ajax({
            // url: "/ajax/builder2/get/" + c.page_id + "/" + c.version,
            url: "/builder/json/get-page-version.json",
            dataType: "json",
            success: function (e) {
                c.debug("Data received from server.");
                if (e && e.error == false) {
                    c.variations = $.parseJSON(e.data);
                    for (var f = 0; f < c.variations; f++) {
                        if (!c.variations[f].variation_name) {
                            c.generateVariationName(f)
                        }
                    }
                    c.variation = c.variation && c.variations[c.variation] ? c.variation : 0;
                    c.renderPageFromData(c.variations[c.variation]);
                    c.last_saved_data = $.toJSON(c.prepareSaveData());
                    c.undo_redo_stack[0] = c.last_saved_data;
                    c.notification("Page loaded.", null, true, 1000);
                    c.builderOracleVariations = new BuilderOracleVariations();
                    if (d && typeof (d) == "function") {
                        d()
                    }
                } else {
                    var g = "Load error";
                    if (e && e.error_message) {
                        g = g + ": " + e.error_message
                    }
                    throw g
                }
            }
        }).error(function () {
            c.notification("Server error: page not loaded.", null, false, 5000)
        })
    };
    this.notification = function (e, h, j, f) {
        this.dim();
        $("#builder_notification").remove();
        var d = j ? "notification_success" : "notification_error";
        var g = $("#notificationTemplate").tmpl({
            message: e,
            notification_class: d,
            image: h
        });
        $("notification").css("display", "none");
        $("body").append(g);
        $("#builder_notification").fadeIn();
        if (f) {
            setTimeout(function () {
                $("#builder_notification").fadeOut(function () {
                    c.undim()
                })
            }, f)
        }
    };
    this.pauseVariation = function (d) {
        if (d == this.variation) {
            this.paused = this.paused ? false : true;
            return this.paused
        } else {
            this.variations[d].paused = this.variations[d].paused ? false : true;
            return this.variations[d].paused
        }
    };
    this.preloadImages = function () {
        for (var e = 0; e < preload_images.length; e++) {
            var d = $("<img />").attr("src", preload_images[e])
        }
    };
    this.prepareSaveData = function () {
        var d = {};
        d.id = this.variation;
        d.page_blocks = [];
        d.elements = [];
        d.background = this.background;
        d.conversions = this.conversions;
        d.custom_code = this.custom_code;
        d.analytics_code = this.analytics_code;
        d.seo_description = this.seo_description;
        d.seo_keywords = this.seo_keywords;
        d.seo_title = this.seo_title;
        d.seo_favicon = this.seo_favicon;
        d.font = this.font;
        d.font_headline = this.font_headline;
        d.font_paragraph = this.font_paragraph;
        d.paused = this.paused;
        d.variation_name = this.variation_name && this.variation_name.length > 0 ? this.variation_name : "A";
        $(".page .page_block").each(function () {
            var h = {};
            h.id = $(this).attr("id");
            h.height = $(this).css("height");
            d.page_blocks.push(h)
        });
        for (var f = 0; f < this.widgets.length; f++) {
            if (this.widgets[f] && this.widgets[f].type && !this.widgets[f].deleted) {
                var g = this.widgets[f];
                var e = {};
                e.type = g.type;
                e.css = g.css;
                e.locked = g.locked;
                e.contents = g.getContentsToSave();
                e.block = $(g.element).parent().parent().attr("id");
                e.top = Math.round(parseInt($(g.element).css("top").replace("px", "")) * 100) / 100 + "px";
                e.left = Math.round(parseInt($(g.element).css("left").replace("px", "")) * 100) / 100 + "px";
                e.width = $(g.element).css("width");
                e.height = $(g.element).css("height");
                e.z_index = g.getZIndex();
                d.elements.push(e)
            }
        }
        this.variations[this.variation] = d;
        return this.variations
    };
    this.publish = function () {
        if (!this.published && !this.didUseSeo() && !this.seo_promoted) {
            this.seo_promoted = true;
            new DarkYesNoDialog("Wait a Second!", "<p>You havenâ€™t added a page Title, Description, Keywords, or a Favicon. We highly recommend you take advantage of our Search Engine Optimization feature so that your page can be included within search engine results.</p>", function () {
                $("#menu_seo").click()
            }, "Take a Look", function () {
                c.doPublish()
            }, "No Thanks")
        } else {
            this.doPublish()
        }
    };
    this.redo = function () {
        if (this.undo_redo_stack[this.undo_redo_iteration + 1]) {
            this.undo_redo_iteration++;
            var d = $.parseJSON(this.undo_redo_stack[this.undo_redo_iteration]);
            this.renderPageFromData(d[this.variation]);
            $("#builder-header-controls").find("#undo").removeClass("disabled");
            if (!(this.undo_redo_stack[this.undo_redo_iteration + 1])) {
                $("#builder-header-controls").find("#redo").addClass("disabled")
            }
        }
    };
    this.removeBranding = function () {
        if (_Page.payperpage) {
            $.ajax({
                url: "/api/pagebuilder/" + c.page_id + "/payperpage_remove_plug",
                type: "get",
                dataType: "json",
                success: function (d) {
                    if (d.error) {
                        payPerPageDialog("footer", {
                            page: c.page_id
                        }, function () {
                            c.plug = null;
                            $("#plug").remove();
                            c.save({
                                force_save: true
                            })
                        })
                    } else {
                        c.plug = null;
                        $("#plug").remove();
                        c.save({
                            force_save: true
                        })
                    }
                }
            })
        } else {
            $.ajax({
                url: "/api/subscription/is_not_freemium",
                dataType: "json",
                success: function (d) {
                    if (!d.error) {
                        c.plug = null;
                        $("#plug").remove();
                        c.save({
                            force_save: true
                        })
                    } else {
                        c.save();
                        freemiumFeature("/builder2?id=" + c.page_id + "&version=" + c.version, "basic5")
                    }
                }
            })
        }
    };
    this.renderPageFromData = function (k) {
        var e = new Date();
        var l = e.getTime();
        $(".loading-info").html("Render page.");
        this.debug("Started render page");
        $(".shadow-draggable").remove();
        if (!k) {
            return
        }
        if (this.widgets && this.widgets.length > 0) {
            for (var g = 0; g <= this.widgets.length; g++) {
                if (this.widgets[g]) {
                    this.widgets[g].draggable_element = null;
                    delete this.widgets[g]
                }
            }
        }
        this.widgets = [];
        this.background = !k.background ? {} : k.background;
        this.plug = k.plug;
        this.custom_code = k.custom_code;
        this.conversions = !k.conversions ? {} : k.conversions;
        this.analytics_code = k.analytics_code;
        this.seo_description = k.seo_description;
        this.seo_keywords = k.seo_keywords;
        this.seo_title = k.seo_title;
        this.seo_favicon = k.seo_favicon;
        this.font = k.font;
        this.font_headline = k.font_headline;
        this.font_paragraph = k.font_paragraph;
        this.paused = k.paused;
        this.variation_name = k.variation_name;
        this.debug("Render page - set data");
        this.updateBackground();
        this.debug("Render page - updated background");
        this.builderOracle.background.setDetails(this.background);
        this.debug("Render page - updated background oracle");
        c.builderOracle.setTrafficChart(c.variations[c.variation].traffic);
        this.debug("Render page - set traffic chart");
        for (g in k.page_blocks) {
            var d = k.page_blocks[g];
            $(".page").find("#" + d.id).css("height", d.height).find(".widget-container").each(function () {
                $(this).remove()
            });
            $(".page").find("#" + d.id + "_shadow").css("height", d.height)
        }
        this.debug("Render page - updated blocks");
        for (var g = 0; g < k.elements.length; g++) {
            var f = k.elements[g];
            if (f.type) {
                switch (f.type) {
                case "button":
                    var j = new WidgetButton(f, g);
                    break;
                case "box":
                    var j = new WidgetBox(f, g);
                    break;
                case "form":
                    var j = new WidgetForm(f, g);
                    break;
                case "headline":
                    var j = new WidgetHeadline(f, g);
                    break;
                case "html":
                    var j = new WidgetHtml(f, g);
                    break;
                case "image":
                    var j = new WidgetImage(f, g);
                    break;
                case "line-horizontal":
                    var j = new WidgetLineHorizontal(f, g);
                    break;
                case "line-vertical":
                    var j = new WidgetLineVertical(f, g);
                    break;
                case "map":
                    var j = new WidgetMap(f, g);
                    break;
                case "social":
                    var j = new WidgetSocial(f, g);
                    break;
                case "strip":
                    var j = new WidgetStrip(f, g);
                    break;
                case "text":
                    var j = new WidgetText(f, g);
                    break;
                case "video":
                    var j = new WidgetVideo(f, g);
                    break
                }
                c.widgets.push(j);
                j.createDraggableSnapHelpers();
                c.debug("Widget " + f.type + " " + (g + 1) + " of " + k.elements.length)
            }
        }
        $("#custom-code-edit").val(k.custom_code);
        $("#analytics-code-edit").val(k.analytics_code);
        if (k.seo_description) {
            $("#seo_description").html(k.seo_description);
            $(".google_description").html(k.seo_description)
        }
        if (k.seo_keywords) {
            $("#seo_keywords").val(k.seo_keywords)
        }
        if (k.seo_title) {
            $("#seo_title").val(k.seo_title);
            $(".google_title").html(k.seo_title)
        }
        this.builderOracle.seo.setFavicon(k.seo_favicon);
        if (k.font) {
            $("#fonts_options_toolbar .scrollablemenu").find("active").removeClass("active");
            $("#fonts_options_toolbar .scrollablemenu").find("").addClass("active")
        }
        this.debug("Render page - after widgets stuff");
        this.updateWidgetFonts();
        this.debug("Render page - updated fonts");
        this.deactivateWidgets();
        var e = new Date();
        var h = e.getTime();
        c.application_profile.last_page_render_time = h - l
    };
    this.resetUndoRedo = function () {
        this.undo_redo_iteration = 0;
        this.undo_redo_stack = [];
        $("#builder-header-controls").find("#undo").addClass("disabled");
        $("#builder-header-controls").find("#redo").addClass("disabled")
    };
    this.save = function (d, f) {
        if (!d) {
            d = {}
        }
        this.deactivateWidgets();
        this.notification("Saving your page...", "https://app.instapage.com/static/img/loading.gif", true);
        var e = this.prepareSaveData();
        var g = $.toJSON(e);
        if (!d.force_save && g == this.last_saved_data) {
            this.notification("Saved.", null, true, 1000);
            if (d.callback) {
                d.callback()
            }
            return
        }
        // $.post("/ajax/builder2/save/" + c.page_id, {
        //     page_data: g,
        //     plug: this.plug,
        //     re_publish: d.re_publish
        // }, function (h) {
        //     try {
        //         if (h && !h.error) {
        //             $.parseJSON(h);
        //             c.last_saved_data = g;
        //             c.version = h.data.version;
        //             c.notification("Saved.", null, true, 1000);
        //             if (d.callback) {
        //                 d.callback()
        //             }
        //         } else {
        //             var k = "Save error";
        //             if (h && h.error_message) {
        //                 k = k + ": " + h.error_message
        //             }
        //             throw k
        //         }
        //     } catch (j) {
        //         c.notification(j.message, null, false, 5000)
        //     }
        // }, "json").error(function () {
        //     c.notification("Server error: page not saved.", null, false, 5000)
        // })

        var success = function (h) {
            try {
                if (h && !h.error) {
                    $.parseJSON(h);
                    c.last_saved_data = g;
                    c.version = h.data.version;
                    c.notification("Saved.", null, true, 1000);
                    if (d.callback) {
                        d.callback()
                    }
                } else {
                    var k = "Save error";
                    if (h && h.error_message) {
                        k = k + ": " + h.error_message
                    }
                    throw k
                }
            } catch (j) {
                c.notification(j.message, null, false, 5000)
            }
        };
        var failure = function () {
            c.notification("Server error: page not saved.", null, false, 5000)
        };

        var parseService = new ParseService();
        parseService.savePage(c.page_id, g, plug, d.re_publish, success, failure);
    };
    this.setBackgroundColor = function (d) {
        if (!this.background.color || d != this.background.color) {
            this.background.color = d;
            this.updateBackground()
        }
    };
    this.setBackgroundImage = function (d) {
        if (!this.background.image || d != this.background.image) {
            this.background.image = d;
            if (!this.background.position) {
                this.background.position = {};
                this.background.position = "top left"
            }
            if (!this.background.repeat) {
                this.background.repeat = {};
                this.background.repeat = "repeat"
            }
            this.updateBackground();
            this.updateUndoRedo()
        }
    };
    this.setBackgroundPosition = function (d) {
        if (!this.background.position) {
            this.background.position = {}
        }
        this.background.position = d;
        this.updateBackground();
        this.updateUndoRedo()
    };
    this.setBackgroundRepeat = function (d) {
        if (!this.background.repeat) {
            this.background.repeat = {}
        }
        this.background.repeat = d;
        this.updateBackground();
        this.updateUndoRedo()
    };
    this.setCenterColumnBackground = function (d) {
        if (!this.background.page) {
            this.background.page = {}
        }
        this.background.page.background_color = d;
        this.updateBackground();
        this.updateUndoRedo()
    };
    this.setFontHeadline = function (d) {
        this.font_headline = d;
        this.updateWidgetFonts()
    };
    this.setFontParagraph = function (d) {
        this.font_paragraph = d;
        this.updateWidgetFonts()
    };
    this.updateBackground = function () {
        if (this.background.color) {
            $("#wrapper").css("background-color", "#" + this.background.color)
        }
        if (this.background.image) {
            $("#wrapper").css("background-image", 'url("' + this.background.image + '")');
            $("#wrapper").css("background-position", this.background.position);
            $("#wrapper").css("background-repeat", this.background.repeat)
        } else {
            $("#wrapper").css("background-image", "none")
        } if (this.background.page) {
            $(".page .page_block").css("border-bottom-color", "transparent");
            $("#wrapper").find(".page_blocks_outer").css("background-color", this.background.page.background_color)
        } else {
            $(".page .page_block").css("border-bottom-color", "#03ddff");
            $("#wrapper").find(".page_blocks_outer").css("background-color", "#fff")
        }
    };
    this.updateUndoRedo = function () {
        for (i in this.undo_redo_stack) {
            if (i > this.undo_redo_iteration) {
                this.undo_redo_stack.splice(i, 1)
            }
        }
        var d = $.toJSON(this.prepareSaveData());
        if (d != this.undo_redo_stack[this.undo_redo_iteration]) {
            this.undo_redo_iteration++;
            this.undo_redo_stack[this.undo_redo_iteration] = d;
            $("#builder-header-controls").find("#undo").removeClass("disabled")
        }
    };
    this.updateWidgetFonts = function () {
        if (this.widgets.length > 0) {
            for (var d = 0; d < this.widgets.length; d++) {
                if (this.widgets[d]) {
                    this.widgets[d].updateFont()
                }
            }
        }
    };
    this.undo = function () {
        if (this.undo_redo_stack[this.undo_redo_iteration - 1]) {
            --this.undo_redo_iteration;
            var d = $.parseJSON(this.undo_redo_stack[this.undo_redo_iteration]);
            this.renderPageFromData(d[this.variation]);
            $("#builder-header-controls").find("#redo").removeClass("disabled");
            if (!(this.undo_redo_stack[this.undo_redo_iteration - 1])) {
                $("#builder-header-controls").find("#undo").addClass("disabled")
            }
        }
    };
    this.undim = function () {
        $(".dim").fadeOut();
        $(".dim").remove()
    };
    try {
        window.onbeforeunload = function () {
            return "Are you sure? You will lose any unsaved changes."
        };
        this.builderOracle = new BuilderOracle();
        this.builderCanvas = new BuilderCanvas();
        this.loadPage(function () {
            var d = new Date();
            c.application_profile.page_load_time = d.getTime() - c.application_profile.start_time;
            c.preloadImages();
            if (c.options.debug && console) {
                console.log(JSON.stringify(c.application_profile, null, "\t"))
            }
            if (b.tour) {
                new PagebuilderTour()
            }
            c.bindKeys()
        })
    } catch (a) {
        $(".loading").hide();
        alert(a)
    }
};