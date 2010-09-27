var iterator = 0;

$(document).ready(function(){
  events();
  append_container_to_page();
})



var set_divider_height = function(divider){

  var container = {};
  container.jq = divider.closest('.container');
  container.height = parseInt(container.jq.css("height"));
  container.padding = parseInt(container.jq.css("padding-top"));

  divider_height = container.height; 
  divider.css("height", divider_height);

}

var set_divider_width = function(divider){

  var container = {};
  container.jq = divider.closest('.container');
  container.width = parseInt(container.jq.css("width"));

  divider_width = container.width; 
  divider.css("height", divider_width);

}

var create_container = function(){
  var container = $('<div class="container simple">');
  var buffer = $('<div class="buffer">');
  var buffer_header = $('<div class="buffer_header">');
  var buffer_body = $('<div class="buffer_body">').attr('contenteditable', 'true')
  var clear = $('<div class="clear">');
  var label = $('<div class="label">').attr('contenteditable', 'true').text("label");
  var buttons = $('<ul class="buttons">')
      .append($('<li class="button yellow left">').html("&larr;"))
      .append($('<li class="button yellow right">').html("&rarr;"))
      .append($('<li class="button yellow up">').html("&uarr;"))
      .append($('<li class="button yellow down">').html("&darr;"))
      .append($('<li class="button red remove">').html("&otimes;"));

  var triangle = $('<div class="triangle">');

  // buffer header colors
  // var colors = ['#4da9d3', '#76b75d', '#d89f4b', '#bc3b26'];
  var colors = [['145', '145', '145'], ['229', '184', '88'], ['66', '112', '150'], ['138', '108', '178'], ['214', '206', '92']];
  var color = colors[iterator++ % 5]
  rgb = sprintf('rgba(%s, %s, %s, 0.6)', color[0], color[1], color[2])

  buffer_header.css('background-color', rgb);
  // buttons.find('ul').css('background-color', rgb);
  // alert(buttons.find('ul').css('background-color', rgb))

  triangle.mousedown(function(d){
    var triangle_y_position = d.pageY;
    var height = parseInt(buffer_body.css('height'));
    var buffer_y_position = triangle_y_position - height;

    $('#page').bind('mousemove', function(e){
      var current_position = e.pageY;
      buffer_body.height = current_position - buffer_y_position;
      buffer_body.css('height', buffer_body.height)
    });
  })



  buttons.hide();
  triangle.hide();

  buffer_header
    .append(label)
    .append(buttons);

  buffer
    .append(buffer_header)
    .append(buffer_body)
    .append(triangle);

  container
    .append(buffer);

  return container;
}

var create_divider_events = function(divider){
  divider.hover(
    function(){
      divider.addClass("hover");
    }
    , function(){
      divider.removeClass("hover");
    }
  );
  return divider; 
}

var clear_div = function(){
  return $('<div class="clear">');
}

var append_container_to_page = function(){

  // fetch page and get properties
  var page = {};
  page.jq = $('#page');
  page.width = parseInt(page.jq.css("width"));
  page.padding_left = parseInt(page.jq.css("padding-left"));


  // create container, resize it, and append it to the pag
  var container = {};
  container.jq = create_container();
  container.width = page.width; 
  container.jq.css("width", container.width)

  container.jq.appendTo(page.jq);
  clear_div().appendTo(page.jq);
}

var get_container_properties = function(c){
  var container = {}
  container.jq = c;
  container.width       = parseInt(container.jq.css("width"));
  container.height      = parseInt(container.jq.css("height"));
  container.min_width   = parseInt(container.jq.css("min-width"));
  container.append_new_width = (container.width - 20) / 2; 
  container.remove_new_width = (container.width * 2) + 20;

  return container;
}

var append_horizontal_container = function(a_container){
  // create wrapped container, divider, and container b
  var wrapper_container = {};
  wrapper_container.jq = a_container.jq.wrap('<div class="container horizontal">').parent();
  var divider = $('<div class="divider vertical">');
  var b_container = {};
  b_container.jq = create_container();

  // create divider dragger
  $('<ul>')
    .append($('<li>').html("&nbsp;"))
    .append($('<li>').html("&nbsp;"))
    .hide()
    .appendTo(divider);

  // resize containers & divider
  console.log(a_container.jq.css("width"));
  a_container.jq.css("width", a_container.append_new_width);
  b_container.jq.css("width", a_container.append_new_width);

  return {'a': a_container, 'b': b_container, 'divider': divider}
}

var create_vertical_container_components = function(a_container){
  var wrapper_container = {};
  wrapper_container.jq = a_container.jq.wrap('<div class="container vertical">').parent();
  var divider = $('<div class="divider horizontal">');
  var b_container = {};
  b_container.jq = create_container();

  b_container.jq.css("width", a_container.width)

  return {'a': a_container, 'b': b_container, 'divider': divider}
}


var events = function(){


  $('.buffer').live('mouseover', function(){
    $('.buttons').hide();
    $('.buttons', this).show();

    $('.triangle').hide();
    $('.triangle', this).show();
  })

  $('.container').live('mouseover', function(){
    // set_divider_position(this);
  })

  $('#page').mouseup(function(){
    $('#page').unbind('mousemove');
  })



  $('.button.right').live('click', function(){

    var a_container = get_container_properties($(this).closest('.container'));

    if (a_container.append_new_width >= a_container.min_width) {
      var divs = append_horizontal_container(a_container);

      a_container.jq
        .after(clear_div())
        .after(divs['b'].jq)
        .after(divs['divider'])

      // $(divs['b'].jq, a_container.jq).hide();
      // $(divs['b'].jq).hide();
      // $(divs['b'].jq).show("slide", { direction: "right" }, 1000);

      // set_divider_height(divs['divider']);
    };
  });

  $('.button.left').live('click', function(){

    var a_container = get_container_properties($(this).closest('.container'));

    if (a_container.append_new_width >= a_container.min_width) {

      var divs = append_horizontal_container(a_container);

      a_container.jq
        .before(divs['b'].jq)
        .before(divs['divider'])
        .after(clear_div());


      // set_divider_height(divs['divider']);
    };
  });

  $('.button.down').live('click', function(){
    var a_container = get_container_properties($(this).closest('.container'));
    var divs = create_vertical_container_components(a_container);

    a_container.jq
      .after(clear_div())
      .after(divs['b'].jq)
      .after(clear_div())
      .after(divs['divider'])
      .after(clear_div())

    // set_divider_width(divs['divider']);
  });

  $('.button.up').live('click', function(){
    var a_container = get_container_properties($(this).closest('.container'));
    var divs = create_vertical_container_components(a_container);

    a_container.jq
      .before(divs['b'].jq)
      .before(clear_div())
      .before(divs['divider'])
      .before(clear_div())
      .after(clear_div());

    // set_divider_width(divs['divider']);
  });

  $('.button.remove').live('click', function(){
    if ($('.buffer').length > 1 ){
          // get content
          var container = get_container_properties($(this).closest('.container'));
          var wrapper_container = {};
          wrapper_container.jq = container.jq.parent();

          if (wrapper_container.jq.attr('id') == "page") {
            container.jq.fadeOut('fast', function(){
              container.jq.next().remove();
              container.jq.remove();
            });

          } else {

            // remove divs
            var parent = wrapper_container.jq.parent();

            var remove_element = function(){
              console.log('remove element')
              container.jq.remove();
              var other_container = wrapper_container.jq.children('.container')

              // resize other container
              if (wrapper_container.jq.hasClass("horizontal")) {
                var width = container.width;
                resize_container(width, other_container);
              } 

              wrapper_container.jq
                .replaceWith(other_container);
            }

            if (parent.hasClass("vertical")) {
              console.log('slide up')

              remove_element()
      //            container.jq
                // .animate({opacity: 0.0}, 150)
                // .hide("blind", { direction: "vertical" }, 250, function(){
                //   remove_element()
                // });

            } else {
              console.log('fade');
              remove_element()
              // container.jq
              //   .animate({opacity: 0.0}, 150)
              //   .fadeOut('fast').hide("blind", { direction: "horizontal" }, 250, function(){
              //     remove_element()
              //   });
            }


          }

    }



  });

}

var resize_container = function(width, container){
  if (container.hasClass("simple")) {
    console.log('simple')
    var c_width = parseInt(container.css("width"));
    var new_width = c_width + width + 20;
    container.css("width", new_width);

  } else if (container.hasClass("horizontal")) {
    console.log('horizontal')
    var h_width = (width - 20) / 2;
    $.each(container.children('.container'), function(index, value){
      var i_container = $(value);
      resize_container(h_width, i_container)
    });

  } else if (container.hasClass("vertical")) {
    console.log('vertical')
    $.each(container.children('.container'), function(index, value){
      var i_container = $(value);
      resize_container(width, i_container);
    })
  } else {
    console.log("fuck: resize_container")
  }
}

var set_divider_position = function(element){

  var container = get_container_properties($(element).closest('.horizontal').parent());
  var top_position = (container.height / 2) - 10;
  console.log(top_position);

  $('.divider ul').hide();
  $('.divider ul', container.jq)
    .fadeIn('fast')
    .css("top", top_position)

}