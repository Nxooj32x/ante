/*****
* CONFIGURATION
*/
    //Main navigation
    $.navigation = $('nav > ul.nav');
'use strict';

/****
* MAIN NAVIGATION
*/

$(document).ready(function($){

  $(document).on('pjax:send', function () {
    NProgress.start();
  });
  $(document).on('pjax:success', function () {
    NProgress.done();
    $("a[data-pjax]").removeClass("active");
    $("a[href='"+location.pathname+"']").addClass("active");
  });
  $(window).on('popstate.pjax', function (event) {
    $.pjax.reload('#js-repo-pjax-container', {timeout: 650});
  });
  if ($.support.pjax) {
    $(document).pjax('a[data-pjax]', '#js-repo-pjax-container')
  }

  // Dropdown Menu
  $.navigation.on('click', 'a', function(e){
    if ($(this).hasClass('nav-dropdown-toggle')) {
      $(this).parent().toggleClass('open');
      resizeBroadcast();
    }

  });

  function resizeBroadcast() {
    var timesRun = 0;
    var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 5){
        clearInterval(interval);
      }
      window.dispatchEvent(new Event('resize'));
    }, 62.5);
  }

  /* ---------- Main Menu Open/Close, Min/Full ---------- */
  $('.navbar-toggler').click(function(){

    if ($(this).hasClass('sidebar-toggler')) {
      $('body').toggleClass('sidebar-hidden');
      resizeBroadcast();
    }

    if ($(this).hasClass('aside-menu-toggler')) {
      $('body').toggleClass('aside-menu-hidden');
      resizeBroadcast();
    }

    if ($(this).hasClass('mobile-sidebar-toggler')) {
      $('body').toggleClass('sidebar-mobile-show');
      resizeBroadcast();
    }

  });

  $('.sidebar-close').click(function(){
    $('body').toggleClass('sidebar-opened').parent().toggleClass('sidebar-opened');
  });

});
