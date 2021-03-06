diagnostic = false;


$(document).ready(function(){
  // toolbar setup
  setupFontSizes();
  fix_toolbar();
  toolbar_events();
  setupInspector();

  $('.header').removeClass('ce')
  $('.values').addClass('hide');
  if (diagnostic) {
    $('.content').addClass('d');
  }
});


//  setup elements
var setupFontSizes = function(){
  var div = $('.font-size.values');
  var list = $('<ul>');
  var a = [9,10,11,12,13,14,18,24,36,48,64,72,96,144,288];
  _(a).each(function(i){
    list.append($('<li>').text(i).attr('size', i));
  });
  div.append(list);
}

var setupColors = function(){
  // var theme = ['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'];
  // var base = [
  //  ['#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f1', '#dce6f2', '#f2dcdb', '#ebf1de', '#e6e0ec', '#dbeef4', '#fdeada'],
  //  ['#d9d9d9', '#595959', '#c4bd97', '#8eb4e3', '#b9cde5', '#e6b9b8', '#d7e4bd', '#ccc1da', '#b7dee8', '#fcd5b5'],
  //  ['#bfbfbf', '#404040', '#948a54', '#558ed5', '#95b3d7', '#d99694', '#c3d69b', '#b3a2c7', '#93cddd', '#fac090'],
  //  ['#a6a6a6', '#262626', '#4a452a', '#17375e', '#376092', '#953735', '#77933c', '#604a7b', '#31859c', '#e46c0a'],
  //  ['#7f7f7f', '#0d0d0d', '#1e1c11', '#254061', '#254061', '#632523', '#4f6228', '#403152', '#215968']
  // ];
  // 
  // var div = $('.colors.values');
  // var clear = $('<div class="clear">').css('height', '4px');
  // var ulTheme = $('<ul class="theme clear">');
  // _(theme).each(function(color, i){
  //   ulTheme.append($('<li>').addClass((i + 1) + '').css('background-color', color)); 
  // })
  // div.append(ulTheme);
  // div.append(clear);
  // 
  // _(base).each(function(colors, index){
  //   var list = $('<ul class="base">');
  //   if (index == 0) {
  //     list.addClass('top');
  //   }
  //   if (index == 4) {
  //     list.addClass('bottom');
  //   }
  //   _(colors).each(function(color, count){
  //     var number = (((index + 1)*10) + (count + 1));
  //     list.append($('<li>').addClass(number + '' ).css('background-color', color));
  //   });
  //   div.append(list);
  // })
  // // div.append(clear.clone());
  // console.log(div);

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

var setupInspector = function(){
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


// modes
var box_edit_mode = function(){
  $('#page').attr('mode', 'box');
  $('#page, .box, .header, .body, .divider, .triangle').removeClass('preview');
  $('.simple.container, .horizontal.container, .vertical.container').removeClass('ce');

  $('.content').attr('contenteditable', 'true');
  $('*').removeClass('transparent_selection');
  $('.box').removeClass('preview');
  $('.header').removeClass('ce').hide();
  $('.square').hide();

  $('#toolbar').show()
  $('#toolbar2').hide()
  $('#toolbar3').hide();
}

var preview_mode = function(){
  $('#page').attr('mode', 'preview');
  $('#page, .box, .header, .body, .divider, .triangle').addClass('preview');
  $('.simple.container, .horizontal.container, .vertical.container').removeClass('ce');

  $('.content').attr('contenteditable', 'false');
  $('*').removeClass('transparent_selection');

  $('.box').addClass('preview');
  $('.header').removeClass('ce').hide();
  $('.square').hide();

  $('#toolbar').hide();
  $('#toolbar2').hide();
  $('#toolbar3').show();
}

var bin_edit_mode = function(){
  $('#page').attr('mode', 'bin');
  $('#page, .box, .header, .body, .divider, .triangle').removeClass('preview')
  $('.simple.container, .horizontal.container, .vertical.container').addClass('ce');

  $('.triangle').show();
  $('.content').attr('contenteditable', 'false');
  $('*').addClass('transparent_selection');


  $('.box').removeClass('preview');
  $('.header').show().addClass('ce');

  $('#toolbar').hide()
  $('#toolbar3').hide();
  $('#toolbar2').show()
}

var different_modes = function(){
  $('#viewing-modes .content-edit').live('click', bin_edit_mode);

  $('#viewing-modes .typing').live('click', box_edit_mode);

  $('#viewing-modes .preview').live('click', preview_mode);
}

// events
var toolbar_events = function(){

  var inspector_events = function(){
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

    $('#information').live('click', function(){
       $(this).toggleClass('ui-icon-radio-off');
       $('#inspector').toggle();
    });

  }

  var toolbar_events = function(){
    var buttons = $('.dropdown .arrows, .dropdown .down-arrow, #colors');
    buttons.live('click', function(e){
      var dropdown = $(this).parent().find('.values');
      $('.values').not(dropdown).addClass('hide');
      dropdown.toggleClass('hide');
    });

    $('.options li').live('click', function(){
      $(this).toggleClass('selected');
    });
  }

  var color_events = function(){
    var colors = $('.toolbar .colors ul.base li, .toolbar .colors ul.theme li');
    colors.live('mouseup', function(event){
      // change the display color
      var color = $(this).css('background-color');
      $('#colors').css('background-color', color);
      $('.toolbar .colors.values').hide();

      // change the colors
      var index = $(this).attr('class');
      var color_class = 'color-' + index;
      editor('color', color_class);

    });

    colors.live('mouseover', function(){
      colors.children('.hl-color').remove();
      $(this).append($('<div class="hl-color">'));
    });
  }

  inspector_events();
  toolbar_events();
  color_events();

  $('#styles-button, #styles-dropdown').live('click', function(){
    dropdown = $(this).find('.values');
    $('.values').not(dropdown).addClass('hide');
    dropdown.toggleClass('hide');
  });

  $('.font.dropdown .values li').live('click', function(){
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('.selected.option');
    parent.text(value);
    $('.values').addClass('hide');
  });

  $('.font-size.dropdown .values li').live('click', function(){
    var element = $(this);
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('input');
    parent.val(value);
    $('.values').addClass('hide');

    var size = element.attr('size');
    editor('size', size);
  });

  $('#bold').live('click', function(){
    editor('style', 'bold');
  });

  $('.lock').live('click', function(){
    $(this).toggleClass('ui-icon-unlocked');
    $(this).toggleClass('ui-icon-locked');
  })

}

