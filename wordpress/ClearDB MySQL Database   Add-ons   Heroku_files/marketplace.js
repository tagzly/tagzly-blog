(function() {

  String.prototype.looselyContains = function(substring) {
    var word, words, _i, _len;
    words = substring.split(' ');
    for (_i = 0, _len = words.length; _i < _len; _i++) {
      word = words[_i];
      if (!(this.search(new RegExp(word, "i")) > -1)) {
        return false;
      }
    }
    return true;
  };

  window.keyMap = {
    8: "backspace",
    9: "tab",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    20: "capslock",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    45: "ins",
    46: "del",
    91: "meta",
    93: "meta",
    224: "meta"
  };

  window.log = function() {
    if (window.console) {
      return console.log.apply(console, arguments);
    }
  };

  $(function() {
    var AddonColorPicker, AddonsFilter, AddonsList, Categories, CategorizedAddon, Docs, IconSelector, ListedAddon, OfferingRow, OfferingsTable, PlanOption, Provisionator, Showcase;
    Docs = Backbone.View.extend({
      initialize: function() {
        var _this = this;
        this.$el = $("#docs");
        this.baseUrl = "https://devcenter.heroku.com/articles/" + (this.$el.data().slug);
        this.languages = ['ruby', 'python', 'java', 'node', 'scala', 'clojure', 'rails', 'rack', 'sinatra', 'sinatra', 'django'];
        return $.getJSON("" + this.baseUrl + "/toc.json", function(toc) {
          var css, lang, section, _i, _j, _len, _len1, _ref;
          if (toc == null) {
            return;
          }
          $('#docs').show();
          for (_i = 0, _len = toc.length; _i < _len; _i++) {
            section = toc[_i];
            css = "";
            _ref = _this.languages;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              lang = _ref[_j];
              if (section.name.match(new RegExp(lang, "gi")) != null) {
                css = lang;
              }
            }
            $('#toc').append("<li><a class='" + css + "' href='" + section.url + "'>" + section.name + "</a></li>");
          }
          return $("#toc").masonry({
            itemSelector: "li",
            columnWidth: 320,
            isAnimated: false
          });
        });
      }
    });
    IconSelector = Backbone.View.extend({
      initialize: function() {
        this.$el = $(".icon_selector");
        return this.$('> li').click(function() {
          var hidden_input;
          $('.icon_selector > li').removeClass('active');
          $(this).addClass('active');
          hidden_input = "#" + $(this).closest('ul').data('inputid');
          return $(hidden_input).val($(this).text().trim());
        });
      }
    });
    Provisionator = Backbone.View.extend({
      initialize: function() {
        var opts, spinner, target;
        this.$form = $("form.provisionator");
        this.$el = this.$form.find("#provisionator");
        this.$form.live("submit", function(event) {
          event.preventDefault();
          app.provisionator.onBefore();
          return $.ajax($(this).attr("action"), {
            dataType: 'json',
            type: $(this).attr("method"),
            complete: app.provisionator.onComplete,
            context: $(this).find("#provisionator"),
            data: $(this).serialize(),
            error: app.provisionator.onError,
            success: app.provisionator.onSuccess
          });
        });
        opts = {
          lines: 8,
          length: 3,
          width: 3,
          radius: 6,
          corners: 1,
          rotate: 0,
          color: "#FFF",
          speed: 2,
          trail: 60,
          shadow: false,
          hwaccel: true,
          className: "spinner",
          zIndex: 20,
          top: "auto",
          left: "auto"
        };
        target = document.getElementById("spinner");
        return spinner = new Spinner(opts).spin(target);
      },
      events: {
        "change select.app": "updateApp"
      },
      onBefore: function() {
        return this.$el.addClass('loading');
      },
      onSuccess: function(msg) {
        return this.find('p.result').addClass('notice').removeClass('error').html(msg.message).slideDown();
      },
      onError: function(xhr) {
        var msg;
        msg = $.parseJSON(xhr.responseText);
        return this.find('p.result').addClass('error').removeClass('notice').html(msg.message).slideDown();
      },
      onComplete: function() {
        return this.removeClass('loading');
      },
      update: function(plan_data) {
        this.$('input.button').val("Add " + plan_data.planName + " for " + plan_data.priceLabel);
        return this.$('.cli').html("heroku addons:add " + plan_data.fullSlug);
      },
      enable: function() {
        this.$('input.button').removeAttr("disabled");
        return this.$('p.cli').addClass("hidden");
      },
      disable: function() {
        this.$('input.button').attr("disabled", "disabled");
        return this.$('p.cli').removeClass("hidden");
      },
      updateApp: function(e) {
        if (this.$('.app').val() === '') {
          return this.disable();
        } else {
          return this.enable();
        }
      }
    });
    PlanOption = Backbone.View.extend({
      initialize: function() {
        return this.data = this.$el.data();
      },
      events: {
        "click": "activate"
      },
      activate: function() {
        return app.provisionator.update(this.data);
      }
    });
    Showcase = Backbone.View.extend({
      initialize: function() {
        var _this = this;
        this.$el = $("#showcase");
        Mousetrap.bind(["right"], function() {
          return $('.stepper.forward').click();
        });
        return Mousetrap.bind(["left"], function() {
          return $('.stepper.backward').click();
        });
      },
      events: {
        "mouseenter": "pause",
        "mouseleave": "play"
      },
      disable: function() {
        return this.disabled = true;
      },
      pause: function() {
        return this.paused = true;
      },
      play: function() {
        return this.paused = null;
      },
      manualForward: function() {
        this.disable();
        return this.forward();
      },
      manualBackward: function() {
        this.disable();
        return this.backward();
      },
      go: function() {
        if (app.showcase.paused != null) {
          return;
        }
        if (app.showcase.disabled != null) {
          return;
        }
        return this.forward();
      },
      forward: function() {
        return this.$('li:first').appendTo(this.$("#showcased_addons"));
      },
      backward: function() {
        return this.$('li:last').prependTo(this.$("#showcased_addons"));
      }
    });
    Categories = Backbone.View.extend({
      initialize: function() {
        this.$el = $("#categories");
        return this.$("ul.categorized_addons > li").map(function() {
          return new CategorizedAddon({
            el: $(this)
          });
        });
      }
    });
    CategorizedAddon = Backbone.View.extend;
    AddonsList = Backbone.View.extend({
      initialize: function() {
        var _this = this;
        this.$el = $("#addons_list");
        this.$("> li").map(function() {
          return new ListedAddon({
            el: $(this)
          });
        });
        Mousetrap.bind(["up", "k"], function() {
          _this.activatePreviousResult();
          return false;
        });
        Mousetrap.bind(["down", "j"], function() {
          _this.activateNextResult();
          return false;
        });
        Mousetrap.bind(["enter", "o"], function() {
          _this.openActiveResult();
          return false;
        });
        return Mousetrap.bind(["y"], function() {
          _this.selectActiveResultCLICommand();
          return false;
        });
      },
      hideAll: function() {
        this.$("> li").removeClass('filter_match');
        return this.$el.removeClass('active');
      },
      deactivateResults: function() {
        this.$("> li").removeClass('active');
        return this.active_row = null;
      },
      activateNextResult: function() {
        if (this.active_row == null) {
          this.active_row = -1;
        }
        this.active_row++;
        return this.activateResult();
      },
      activatePreviousResult: function() {
        this.active_row--;
        if (this.active_row < 0) {
          return app.listed_addons_filter.focus();
        } else {
          return this.activateResult();
        }
      },
      openActiveResult: function() {
        if (this.active_row != null) {
          return window.location = this.$("> li.filter_match:eq(" + this.active_row + ") a:first")[0];
        }
      },
      selectActiveResultCLICommand: function() {
        if (this.active_row != null) {
          return this.$("> li.filter_match:eq(" + this.active_row + ") .cli:first").selectText();
        }
      },
      activateResult: function() {
        this.$("> li").removeClass('active').removeClass('after_active');
        this.$("> li.filter_match:eq(" + this.active_row + ")").addClass('active');
        return this.$("> li.filter_match:eq(" + (this.active_row + 1) + ")").addClass('after_active');
      },
      filter: function(q) {
        var display_legend, matches, results_count;
        results_count = 0;
        display_legend = false;
        this.$("> li").each(function() {
          if ($(this).text().looselyContains(q)) {
            results_count++;
            if ($(this).find('span.premium-support').length > 0) {
              display_legend = true;
            }
            return $(this).addClass('filter_match');
          } else if (display_legend && $(this).hasClass('legend')) {
            return $(this).addClass('filter_match');
          } else {
            return $(this).removeClass('filter_match');
          }
        });
        $('#addons_list_heading, ').addClass('active');
        this.$el.addClass('active');
        matches = results_count === 1 ? "match" : "matches";
        if (results_count === 0) {
          results_count = "No";
        }
        $('#addons_list_heading').html("" + results_count + " " + matches + " found for <em>&lsquo;</em><span id=\"queryecho\"></span><em>&rsquo;</em>");
        return $('#queryecho').text(q);
      }
    });
    ListedAddon = Backbone.View.extend({
      initialize: function() {
        return this.$(".code input").click(function() {
          return $(this).select();
        });
      },
      toggle: function() {
        if (this.isActive()) {
          return this.collapse();
        } else {
          return this.expand();
        }
      },
      isActive: function() {
        return this.$el.hasClass('expanded');
      },
      expand: function() {
        return this.$el.addClass('expanded');
      },
      collapse: function() {
        return this.$el.removeClass('expanded');
      },
      render: function() {
        return this;
      }
    });
    AddonsFilter = Backbone.View.extend({
      initialize: function() {
        var _this = this;
        this.$el = $("#addons_filter");
        this.populateViaQueryString();
        Mousetrap.bind("/", function() {
          _this.focus();
          return false;
        });
        return Mousetrap.bind("esc", function() {
          _this.reset();
          _this.focus();
          return false;
        });
      },
      events: {
        "focus input": "deactivateResults",
        "keydown input": "detectTabOut",
        "keyup input": "run",
        "click a": "reset"
      },
      populateViaQueryString: function() {
        if (url('?q')) {
          return this.set(decodeURIComponent(url('?q')));
        }
      },
      set: function(value) {
        this.$('input').val(value);
        return this.run();
      },
      reset: function() {
        return this.set('');
      },
      focus: function() {
        return this.$("input").focus();
      },
      activateNextResult: function(event) {
        return app.addons_list.activateNextResult();
      },
      deactivateResults: function() {
        return app.addons_list.deactivateResults();
      },
      detectTabOut: function(event) {
        if (event && keyMap[event.keyCode] === 'tab') {
          return this.activateNextResult();
        }
      },
      run: function(event) {
        var q;
        if (event) {
          if (keyMap[event.keyCode] === 'esc') {
            this.$('input').val('');
          }
          if (keyMap[event.keyCode] === 'enter' || keyMap[event.keyCode] === 'down') {
            this.$('input').trigger('blur');
            this.activateNextResult();
          }
        }
        q = this.$('input').val();
        if (q === '') {
          this.$('a.reset').removeClass('active');
        } else {
          this.$('a.reset').addClass('active');
        }
        if (q.length < 3) {
          app.addons_list.hideAll();
          $('#addons_list_heading').removeClass('active').html($('#addons_list_heading').data('content'));
          if (history) {
            history.replaceState({}, document.title, "/");
          }
          return;
        }
        if (history) {
          history.replaceState({}, document.title, "/?q=" + q);
        }
        return app.addons_list.filter(q);
      }
    });
    OfferingsTable = Backbone.View.extend({
      initialize: function() {
        this.$el = $("#edit_offerings");
        return this.$("tbody tr").map(function() {
          return new OfferingRow({
            el: $(this)
          });
        });
      }
    });
    OfferingRow = Backbone.View.extend({
      events: {
        "change input": "update"
      },
      initialize: function() {
        var _this = this;
        return this.$("form").live("ajax:before", function() {}).live("ajax:success", function(data, status, xhr) {
          return _this.displayResult("Saved", "success");
        }).live("ajax:error", function(xhr, status, error) {
          return _this.displayResult("Invalid value", "error");
        });
      },
      update: function() {
        return this.$("form").submit();
      },
      displayResult: function(msg, css_class) {
        var _this = this;
        this.$('.result').text(msg).removeClass("error success").addClass("visible " + css_class);
        return setTimeout((function() {
          return _this.$('.result').removeClass("visible");
        }), 3000);
      }
    });
    AddonColorPicker = Backbone.View.extend({
      max_suggestions: 10,
      min_lightness: 0.5,
      initialize: function() {
        var _this = this;
        this.$el = $("#addon_color");
        if ($('input#addon_color').length > 0) {
          return $('#logo').load(function() {
            var canvas, ctx, img;
            img = new Image;
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            img.crossOrigin = "Anonymous";
            img.src = $('#logo').data('corsurl');
            return img.onload = function() {
              var color, palette, rgb, _i, _len, _ref;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              palette = [];
              _ref = createPalette(img, _this.max_suggestions);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                rgb = _ref[_i];
                color = tinycolor("rgb(" + (rgb.join(", ")) + ")");
                if (!(color.toHsl().l < _this.min_lightness)) {
                  palette.push(color);
                }
              }
              return _this.$el.spectrum({
                showInput: true,
                showInitial: true,
                chooseText: "Apply",
                showButtons: false,
                preferredFormat: "hex",
                showPalette: true,
                palette: palette
              });
            };
          });
        }
      }
    });
    window.app = {
      init: function() {},
      initAddonsShow: function() {
        $("ul.benefits").masonry({
          itemSelector: "li",
          columnWidth: 480,
          isAnimated: false
        });
        $("ul.benefits").removeClass("disabled");
        this.plan_options = $("#plan_options > li").map(function() {
          return new PlanOption({
            el: $(this)
          });
        });
        $("ul#plan_options li").addClass('transition-disabled');
        setTimeout((function() {
          return app.plan_options[0].activate();
        }), 100);
        this.provisionator = new Provisionator;
        return this.docs = new Docs;
      },
      initAddonsIndex: function() {
        this.addons_list = new AddonsList;
        this.listed_addons_filter = new AddonsFilter;
        this.showcase = new Showcase;
        return this.categories = new Categories;
      },
      initAddonsEdit: function() {
        if ($("table.audit").length > 0) {
          $("table.audit").stupidtable();
        }
        this.addon_color_picker = new AddonColorPicker;
        return this.offerings_table = new OfferingsTable;
      },
      refresh: function() {}
    };
    app.init();
    if ($('#addons_index').length > 0) {
      app.initAddonsIndex();
    }
    if ($('#addons_show').length > 0) {
      app.initAddonsShow();
    }
    if ($('#addons_edit').length > 0) {
      app.initAddonsEdit();
    }
    $(".cli").click(function() {
      return $(this).selectText();
    });
    $('ul.menu a.active').click(function(event) {
      $(this).closest('ul.menu').toggleClass('collapsed');
      return false;
    });
    window.addEventListener('click', function() {
      return $('ul.menu').addClass('collapsed');
    });
    if ($('.icon_selector').length > 0) {
      this.icon_selector = new IconSelector;
    }
    $('#edit_features, #edit_benefits, #edit_categories').sortable({
      axis: 'y',
      update: function() {
        return $.post($(this).data('updateurl'), $(this).sortable('serialize'));
      }
    });
    return Melange.init({
      logToConsole: window.env === 'development',
      preventBubbling: false && window.env === 'development',
      user: window.heroku_oauth_id
    });
  });

}).call(this);
