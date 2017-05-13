define('pajax',function (require, exports, module) {
    $(document).on('pjax:send', function () {
        NProgress.start();
    });
    $(document).on('pjax:success', function () {
        NProgress.done();
        $("a[href='"+location.pathname+"']").parent().addClass("active");
    });
    $(window).on('popstate.pjax', function (event) {
        $.pjax.reload('#js-repo-pjax-container', {timeout: 650});
    });
    // $.pjax.reload('#js-repo-pjax-container', {timeout: 650});
    if ($.support.pjax) {
        $(document).pjax('a[data-pjax]', '#js-repo-pjax-container')
    }
});
define('backtoTop',function (require, exports, module) {
//** jQuery Scroll to Top Control script- (c) Dynamic Drive DHTML code library: http://www.dynamicdrive.com.
//** Available/ usage terms at http://www.dynamicdrive.com (March 30th, 09')
//** v1.1 (April 7th, 09'):
//** 1) Adds ability to scroll to an absolute position (from top of page) or specific element on the page instead.
//** 2) Fixes scroll animation not working in Opera.


    var scrolltotop = {
        //startline: Integer. Number of pixels from top of doc scrollbar is scrolled before showing control
        //scrollto: Keyword (Integer, or "Scroll_to_Element_ID"). How far to scroll document up when control is clicked on (0=top).
        setting: {startline: 100, scrollto: 0, scrollduration: 1000, fadeduration: [500, 100]},
        controlHTML: '', //<img src="assets/img/up.png" style="width:51px; height:42px" /> //HTML for control, which is auto wrapped in DIV w/ ID="topcontrol"
        controlattrs: {offsetx: 5, offsety: 5}, //offset of control relative to right/ bottom of window corner
        anchorkeyword: '#top', //Enter href value of HTML anchors on the page that should also act as "Scroll Up" links

        state: {isvisible: false, shouldvisible: false},

        scrollup: function () {
            if (!this.cssfixedsupport) //if control is positioned using JavaScript
                this.$control.css({opacity: 0}) //hide control immediately after clicking it
            var dest = isNaN(this.setting.scrollto) ? this.setting.scrollto : parseInt(this.setting.scrollto)
            if (typeof dest == "string" && jQuery('#' + dest).length == 1) //check element set by string exists
                dest = jQuery('#' + dest).offset().top
            else
                dest = 0
            this.$body.animate({scrollTop: dest}, this.setting.scrollduration);
        },

        keepfixed: function () {
            var $window = jQuery(window)
            var controlx = $window.scrollLeft() + $window.width() - this.$control.width() - this.controlattrs.offsetx
            var controly = $window.scrollTop() + $window.height() - this.$control.height() - this.controlattrs.offsety
            this.$control.css({left: controlx + 'px', top: controly + 'px'})
        },

        togglecontrol: function () {
            var scrolltop = jQuery(window).scrollTop()
            if (!this.cssfixedsupport)
                this.keepfixed()
            this.state.shouldvisible = (scrolltop >= this.setting.startline) ? true : false
            if (this.state.shouldvisible && !this.state.isvisible) {
                this.$control.stop().animate({opacity: 1}, this.setting.fadeduration[0])
                this.state.isvisible = true
            }
            else if (this.state.shouldvisible == false && this.state.isvisible) {
                this.$control.stop().animate({opacity: 0}, this.setting.fadeduration[1])
                this.state.isvisible = false
            }
        },

        init: function () {
            jQuery(document).ready(function ($) {
                var mainobj = scrolltotop
                var iebrws = document.all
                mainobj.cssfixedsupport = !iebrws || iebrws && document.compatMode == "CSS1Compat" && window.XMLHttpRequest //not IE or IE7+ browsers in standards mode
                mainobj.$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body')
                mainobj.$control = $('<div id="topcontrol">' + mainobj.controlHTML + '</div>')
                    .css({
                        position: mainobj.cssfixedsupport ? 'fixed' : 'absolute',
                        bottom: mainobj.controlattrs.offsety,
                        right: mainobj.controlattrs.offsetx,
                        opacity: 0,
                        cursor: 'pointer'
                    })
                    .attr({title: 'Scroll Back to Top'})
                    .click(function () {
                        mainobj.scrollup();
                        return false
                    })
                    .appendTo('body')
                if (document.all && !window.XMLHttpRequest && mainobj.$control.text() != '') //loose check for IE6 and below, plus whether control contains any text
                    mainobj.$control.css({width: mainobj.$control.width()}) //IE6- seems to require an explicit width on a DIV containing text
                mainobj.togglecontrol()
                $('a[href="' + mainobj.anchorkeyword + '"]').click(function () {
                    mainobj.scrollup()
                    return false
                })
                $(window).bind('scroll resize', function (e) {
                    mainobj.togglecontrol()
                })
            })
        }
    }

    scrolltotop.init()
});
define('app',['backtoTop','pajax'],function(require, exports, module){
    require('backtoTop');
    require('pajax');
    var App = function () {
        //Fixed Header
        function handleHeader() {
            jQuery(window).scroll(function() {
                if (jQuery(window).scrollTop()>100){
                    jQuery(".header-fixed .header-sticky").addClass("header-fixed-shrink");
                }
                else {
                    jQuery(".header-fixed .header-sticky").removeClass("header-fixed-shrink");
                }
            });
        }

        //Header Mega Menu
        function handleMegaMenu() {
            jQuery(document).on('click', '.mega-menu .dropdown-menu', function(e) {
                e.stopPropagation();
            })
        }

        //Search Box (Header)
        function handleSearch() {
            jQuery('.search').click(function () {
                if(jQuery('.search-btn').hasClass('fa-search')){
                    jQuery('.search-open').fadeIn(500);
                    jQuery('.search-btn').removeClass('fa-search');
                    jQuery('.search-btn').addClass('fa-times');
                } else {
                    jQuery('.search-open').fadeOut(500);
                    jQuery('.search-btn').addClass('fa-search');
                    jQuery('.search-btn').removeClass('fa-times');
                }
            });
        }

        //Search Box v1 (Header v5)
        function handleSearchV1() {
            jQuery('.header-v5 .search-button').click(function () {
                jQuery('.header-v5 .search-open').slideDown();
            });

            jQuery('.header-v5 .search-close').click(function () {
                jQuery('.header-v5 .search-open').slideUp();
            });

            jQuery(window).scroll(function(){
                if(jQuery(this).scrollTop() > 1) jQuery('.header-v5 .search-open').fadeOut('fast');
            });
        }

        //Sidebar Navigation Toggle
        function handleToggle() {
            jQuery('.list-toggle').on('click', function() {
                jQuery(this).toggleClass('active');
            });

            /*
             jQuery('#serviceList').on('shown.bs.collapse'), function() {
             jQuery(".servicedrop").addClass('glyphicon-chevron-up').removeClass('glyphicon-chevron-down');
             }

             jQuery('#serviceList').on('hidden.bs.collapse'), function() {
             jQuery(".servicedrop").addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-up');
             }
             */
        }

        //Equal Height Columns
        function handleEqualHeightColumns() {
            var EqualHeightColumns = function () {
                $(".equal-height-columns").each(function() {
                    heights = [];
                    $(".equal-height-column", this).each(function() {
                        $(this).removeAttr("style");
                        heights.push($(this).height()); // write column's heights to the array
                    });
                    $(".equal-height-column", this).height(Math.max.apply(Math, heights)); //find and set max
                });
            }

            EqualHeightColumns();
            $(window).resize(function() {
                EqualHeightColumns();
            });
            $(window).load(function() {
                EqualHeightColumns("img.equal-height-column");
            });
        }

        //Hover Selector
        function handleHoverSelector() {
            $('.hoverSelector').on('hover', function(e) {
                $('.hoverSelectorBlock', this).toggleClass('show');
                e.stopPropagation();
            });
        }

        //Bootstrap Tooltips and Popovers
        function handleBootstrap() {
            /*Bootstrap Carousel*/
            jQuery('.carousel').carousel({
                interval: 15000,
                pause: 'hover'
            });

            /*Tooltips*/
            jQuery('.tooltips').tooltip();
            jQuery('.tooltips-show').tooltip('show');
            jQuery('.tooltips-hide').tooltip('hide');
            jQuery('.tooltips-toggle').tooltip('toggle');
            jQuery('.tooltips-destroy').tooltip('destroy');

            /*Popovers*/
            jQuery('.popovers').popover();
            jQuery('.popovers-show').popover('show');
            jQuery('.popovers-hide').popover('hide');
            jQuery('.popovers-toggle').popover('toggle');
            jQuery('.popovers-destroy').popover('destroy');
        }

        return {
            init: function () {
                handleBootstrap();
                handleSearch();
                handleSearchV1();
                handleToggle();
                handleHeader();
                handleMegaMenu();
                handleHoverSelector();
                handleEqualHeightColumns();
            },

            //Scroll Bar
            initScrollBar: function () {
                jQuery('.mCustomScrollbar').mCustomScrollbar({
                    theme:"minimal",
                    scrollInertia: 300,
                    scrollEasing: "linear"
                });
            },

            //Counters
            initCounter: function () {
                jQuery('.counter').counterUp({
                    delay: 10,
                    time: 1000
                });
            },

            //Parallax Backgrounds
            initParallaxBg: function () {
                jQuery(window).load(function() {
                    jQuery('.parallaxBg').parallax("50%", 0.2);
                    jQuery('.parallaxBg1').parallax("50%", 0.4);
                });
            },

            //Animate Dropdown
            initAnimateDropdown: function () {
                function MenuMode() {
                    jQuery('.dropdown').on('show.bs.dropdown', function(e){
                        jQuery(this).find('.dropdown-menu').first().stop(true, true).slideDown();
                    });
                    jQuery('.dropdown').on('hide.bs.dropdown', function(e){
                        jQuery(this).find('.dropdown-menu').first().stop(true, true).slideUp();
                    });
                }

                jQuery(window).resize(function(){
                    if (jQuery(window).width() > 768) {
                        MenuMode();
                    }
                });

                if (jQuery(window).width() > 768) {
                    MenuMode();
                }
            },

        };

    }();
    App.init();
});

seajs.use('app');
