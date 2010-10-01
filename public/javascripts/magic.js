var iterator = 0;
var start = {}

$(document).ready(function(){
  events();
  append_container_to_page();
})


// create elements

var clear_div = function(){
  return $('<div class="clear">');
}

var create_text_box = function(){
  var e = {};
  e.box = $('<div class="box">');
  e.header = $('<div class="header">');
  e.buttons = $('<ul class="buttons">')
    .append($('<li class="left button">').html("&larr;"))
    .append($('<li class="right button">').html("&rarr;"))
    .append($('<li class="up button">').html("&uarr;"))
    .append($('<li class="down button">').html("&darr;"));
  e.remove = $('<div class="remove">');
  e.remove_button = $('<div class="remove_button">');
  e.triangle = $('<div class="triangle">');
  e.body = $('<div class="body">');
  e.content = $('<div class="content">');


  e.content.attr('contenteditable', 'true');

  e.remove
    .append(e.remove_button);

  e.header
    .append(e.remove)
    .append(e.buttons)
    .append(clear_div());

  e.body
    .append(e.content)
    .append(e.triangle);

  e.box
    .append(e.header)
    .append(e.body);

  e.buttons.hide();
  e.remove.hide();
  e.triangle.hide();

  return e.box;
}

var create_simple_container = function(){
  var container = $('<div class="simple container">');
  var text_box = create_text_box();

  container
    .append(text_box);

  return container;
}

var create_horizontal_container = function(){
  var h_container = $('<div class="horizontal container">');
  var a_container = create_simple_container();
  var v_divider = $('<div class="vertical divider">');
  var b_container = create_simple_container();

  a_container.addClass('a');
  b_container.addClass('b');

  h_container
    .append(a_container)
    .append(v_divider)
    .append(b_container)
    .append(clear_div())

  return h_container;
}

var create_vertical_container = function(){
  var v_container = $('<div class="vertical container">');
  var a_container = create_simple_container();
  var h_divider = $('<div class="horizontal divider">');
  var b_container = create_simple_container();

  a_container.addClass('a');
  b_container.addClass('b');

  v_container
    .append(a_container)
    .append(clear_div())
    .append(h_divider)
    .append(clear_div())
    .append(b_container)
    .append(clear_div())

  return v_container;
}


// helper methods

var get_parent = function(container){
  return container.parent('.container');
}

var get_siblings = function(container){
  var children = container.children('.container')
  var c = {};
  c.a = $(children[0]);
  c.b = $(children[1]);
  return c;
}

var get_properties = function(c){
  var container = {}
  container.jq = c;
  container.position = container.jq.hasClass('b') ? 'b' : 'a';
  container.width       = parseInt(container.jq.css("width"));
  container.height      = parseInt(container.jq.css("height"));
  container.min_width   = parseInt(container.jq.css("min-width"));
  container.append_new_width = (container.width - 20) / 2; 
  container.remove_new_width = (container.width * 2) + 20;

  return container;
}

var resize_container = function(width, container){
  console.log('initial: ' + container.attr('class'));
  console.log(container)

  if (container.hasClass("simple")) {
    console.log('simple');
    var c_width = parseInt(container.css("width"));
    var new_width = c_width + width + 20;
    container.css("width", new_width);

  } else if (container.hasClass("horizontal")) {
    console.log('horizontal')
    var h_width = (width - 20) / 2;
    $.each(container.children('.container'), function(index, i_container){
      resize_container(h_width, $(i_container))
    });

  } else if (container.hasClass("vertical")) {
    console.log('vertical')
    $.each(container.children('.container'), function(index, i_container){
      resize_container(width, $(i_container));
    })
  } else {
    console.log("fuck: resize_container")
  }
}

var run_tests = function(){

  // a horizontal or vertical container does not have two children
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if($(container).children('.container').length != 2){
      alert('a complex container has the wrong number of children!');
    }
  });

  // a horizontal or vertical container has two children with the same position
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if(($(container).children('.a').length == 2) || ($(container).children('.b').length == 2)){
      alert('a complex container has two a or two b chilren!');
    }
  });

  // B before A 
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    var children = $(container).children('.container')
    if($(children[0]).hasClass('b') || $(children[1]).hasClass('a') ){
      alert('a complex container has its chilren out of order');
    }
  });

  // missing a divider
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if($(container).children('.divider').length == 0){
      alert('a complex container is missing a divider');
    }
  });
}


// append to page

var append_container_to_page = function(){

  // fetch page and get properties
  var page = {};
  page.jq = $('#page');
  page.width = parseInt(page.jq.css("width"));

  // create container, resize it, and append it to the pag
  var container = {};
  container.jq = create_simple_container();
  container.width = page.width; 
  container.jq.css("width", container.width)
  container.jq.find('.content').html("Welcome to Boxes & Bins")


  container.jq.appendTo(page.jq);
  clear_div().appendTo(page.jq);
}


// actions + events

var additive = function(button, container){
  var new_container_type = (button == 'up' || button == 'down') ? 'vertical' : 'horizontal'
  var original_container_position = (button == 'right' || button == 'down') ? 'a' : 'b';

  var original_container  = {};
  original_container.jq   = container;
  original_container._    = get_properties(original_container.jq);

  if ((new_container_type == 'vertical') || (original_container._.append_new_width >= original_container._.min_width)){
    var new_container = {};
    new_container.jq = (new_container_type == 'vertical') ? create_vertical_container() : create_horizontal_container();
    new_container.original = original_container
      .jq.clone().
      removeClass('a b').addClass(original_container_position)
      .removeAttr('width');
    new_container.sibling = get_siblings(new_container.jq);

    // swap in original container
    new_container.sibling[original_container_position].replaceWith(new_container.original);
    new_container.sibling = get_siblings(new_container.jq);

    // set new_containers position
    new_container.jq.addClass(original_container._.position);

    // set sibling properties
    var sibling_width = (new_container_type == 'vertical') ? 'width' : 'append_new_width';
    new_container.sibling.a.css('width', original_container._[sibling_width]);
    new_container.sibling.b.css('width', original_container._[sibling_width]);

    // replace original_container with h_container
    original_container.jq.replaceWith(new_container.jq);
    run_tests();

  }
}

var remove_container = function(container){
  var original_container = {};
  original_container.jq  = container;
  original_container._   = get_properties(original_container.jq);

  var parent_container  = {};
  parent_container.jq   = get_parent(original_container.jq);
  parent_container._    = get_properties(parent_container.jq);
  parent_container.other_position = (original_container._.position == 'a') ? 'b' : 'a';
  parent_container.sibling = get_siblings(parent_container.jq);

  // other_container
  var other_container = {};
  other_container.jq  = parent_container.sibling[parent_container.other_position];
  other_container._   = get_properties(other_container.jq);


  // set new position
  other_container.jq.removeClass('a b').addClass(parent_container._.position);


  // set new width
   if(parent_container.jq.hasClass('horizontal')){
     resize_container(original_container._.width, other_container.jq);
   }

  // replace parent container (H or V) with the other sibling container
  parent_container.jq.replaceWith(other_container.jq);
  run_tests()
}

var events = function(){

  // page
  $('#page').mouseup(function(){
    $('#page').unbind('mousemove');
    $('.triangle_on').removeClass('triangle_on');
    // document.selection.clear;
  })


  //  container
  $('.container').live('mouseover', function(){
  });

  $('.container').live('mouseout', function(){
    $('.buttons').hide();
  });


  // box
  $('.box').live('mouseover', function(){
    $('.triangle').hide();
    $('.triangle', this).show();
  });

  $('.box').live('mouseout', function(){
  });

  // header
  $('.header').live('mouseover', function(){
    $('.buttons, .remove').hide();
    $('.buttons, .remove', this).show();

    $('.header').removeClass('hover');
    $(this).addClass('hover');
  });

  $('.header').live('mouseout', function(){
    $('.buttons, .remove', this).hide();
    $('.header').removeClass('hover');
  });


  $('.button').live('click', function(){
    direction = $(this).attr('class').split(" ")[0];
    additive(direction, $(this).closest('.container'))
  });

  $('.remove').live('click', function(){
    if($('.box').length > 1){
      remove_container($(this).closest('.container'));
    }
  });

  $('.triangle').live('mousedown',function(d){

    var triangle_y_position = d.pageY;
    var body = $(this).closest('.body');
    var body_height = parseInt(body.css('height'));
    var buffer_y_position = triangle_y_position - body_height;

    $('#page, .box, .header, ul, li').addClass('triangle_on');

    $('#page').bind('mousemove', function(e){
      var current_position = e.pageY;
      body_height = current_position - buffer_y_position;
      body.css('min-height', body_height)
    });
  })

}


// preview mode

var preview_mode = function(){
  $('#page, .box, .header, .body').addClass('preview')
}

