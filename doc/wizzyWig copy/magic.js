var selection = {};

$(document).ready(function(){
  events()
})

var events = function(){

  $('li').click(function(){

    var button = {};
    button.jq = $(this);
    button.type = button.jq.attr('type');


    if (button.jq.hasClass('color')) {
      var new_class = 'c' + button.type;
    } else if (button.jq.hasClass('font-size')) {
      var new_class = 'f' + button.type;
    }


    // get start and end
    var getNum = /[0-9]+/;
    var anchor = parseInt(getNum.exec(selection.anchor)[0]);
    var focus = parseInt(getNum.exec(selection.focus)[0]);

    if (anchor <= focus) {
      var begin = anchor;
      var end = focus;
    } else {
      var begin = focus;
      var end = anchor;

    }

    // iterate through the selection
    for(var i = begin; i < end; ++i ) {
      var id = 's' + i;
      var element = $(document.getElementById(id));

      if (button.jq.hasClass('color')) {
        var current_class = /c\d+/.exec(element.attr('class'))[0];
      } else if (button.jq.hasClass('font-size')) {
        var current_class = /f\d+/.exec(element.attr('class'))[0];
      }
      element.removeClass(current_class).addClass(new_class);
      //console.log($(element).html());
    }
  })

  $('.content').mouseup(function(){
    var sel = document.getSelection();
    selection.anchor = $(sel.anchorNode).parent().attr('id');
    selection.focus = $(sel.focusNode).parent().attr('id');
  });
}

