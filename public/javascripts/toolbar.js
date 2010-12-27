
$(document).ready(function(){
  setupFontSizes();
  fix_toolbar();
  toolbar_events();
});

var setupFontSizes = function(){
  var div = $('.font-size.values');
  var list = $('<ul>');
  var a = _.range(1,73);
  _(a).each(function(i){
    list.append(
      $('<li>').html($('<a>')
        .text(i)
        .attr('href', "javascript:editor('size', " + i + ", text_selection)")
    ));
  });
  div.append(list);
}

var fix_toolbar = function(){
   var msie6 = $.browser == 'msie' && $.browser.version < 7;
   if (!msie6) {
     var top = $('.toolbar').offset().top - parseFloat($('.toolbar').css('margin-top').replace(/auto/, 0));
     var left = $('#page').offset().left;
     $(window).scroll(function (event) {
       // what the y position of the scroll is
       var y = $(this).scrollTop();

       // whether that's below the form
       if (y >= top) {
         // if so, ad the fixed class
         $('.toolbar').addClass('fixed').css('left', left);
         $('#ruler').addClass('fixed').css('left', left);
         $('#page').addClass('toolbarFixed');
       } else {
         // otherwise remove it
         $('.toolbar').removeClass('fixed');
         $('#ruler').removeClass('fixed');
         $('#page').removeClass('toolbarFixed');
       }
     });
   }
}

var inspector = function(){
  var inspector = $('<div id="inspector">')
  var header =
    $('<div class="inspector-header">').html(
      $('<div class="inspector-close-button">'));

  inspector.append(header);
  inspector.draggable();
  inspector.css('position', 'fixed');
  inspector.hide()
  $('body').append(inspector);
}

var toolbar_events = function(){

  $('#styles-button, #styles-dropdown').live('click', function(){
    $('.values').hide();
    $(this).find('.values').show()
  });

  $('.font.dropdown .values li').live('click', function(){
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('.selected.option');
    parent.text(value);
    $('.values').hide();
  });

  $('.font-size.dropdown .values li').live('click', function(){
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('input');
    parent.val(value);
    $('.values').hide();
  });

  var colors = $('.toolbar .colors ul.base li, .toolbar .colors ul.theme li');
  colors.live('mouseup', function(){
    var color = $(this).css('background-color');
    $('#colors').css('background-color', color);
  });

  colors.live('mouseover', function(){
    colors.children('.hl-color').remove();
    $(this).append($('<div class="hl-color">'));
  });

  // inspector
  $('.inspector-header').live('mouseover', function(){
    $('.inspector-close-button').addClass('inspector-close-button-hl');
  });

  $('.inspector-header').live('mouseout', function(){
    $('.inspector-close-button').removeClass('inspector-close-button-hl');
  });

  $('.inspector-close-button').live('click', function(){
    $('#inspector').hide();
    $('#information').removeClass('ui-icon-radio-off');
  })

  // toolbar
  $('.options li').live('click', function(){
    $(this).toggleClass('selected');
  })

  $('#information').live('click', function(){
    $(this).toggleClass('ui-icon-radio-off');
    $('#inspector').toggle();
  })
}