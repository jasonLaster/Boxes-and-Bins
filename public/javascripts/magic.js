var iterator = 0;
var box_id = "";
var container_id = "";
var text_selection = null;

$(document).ready(function(){
  events();
  $('#flash').hide()
  load_page(content)
  box_id = max_id('.box');
  container_id = max_id('.container.horizontal, .container.vertical, .container.simple');
  inspector();
  $('.values').hide();
  box_edit_mode();
  fixSquarePosition()
  $('.square').hide();
})


// create elements
var clear_div = function(){
  return $('<div class="clear">');
}

// this code will probably change with Jons changes
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
  e.square = $('<div class="square">');
  e.body = $('<div class="body">');
  e.content = $('<div class="content">');

  e.content
    .attr('contenteditable', 'true')

  e.content.html($('<p><span><br></span></p>'));

  e.box.attr('id', ++box_id);

  e.remove
    .append(e.remove_button);

  e.header.addClass('ce');

  e.header
    .append(e.remove)
    .append(e.buttons)
    .append(clear_div());

  e.body
    .append(e.content)
    .append(e.square.clone().addClass('left'))
    .append(e.square.clone().addClass('bottom'))
    .append(e.square.clone().addClass('right'))
    .append(e.triangle);

  e.box
    .append(e.header)
    .append(e.body);

  e.buttons.hide();
  e.remove.hide();
  e.triangle.hide();

  return e.box;
}

// also changed
var create_simple_container = function(){
  var container = $('<div class="simple container">');
  var text_box = create_text_box();

  container
    .attr('id', ++container_id)

  container
    .append(text_box);

  return container;
}

var create_horizontal_container = function(){
  var h_container = $('<div class="horizontal container">');
  var a_container = create_simple_container();
  var v_divider = $('<div class="vertical divider">');
  var b_container = create_simple_container();

  h_container.attr('id', ++container_id);
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

  v_container.attr('id', ++container_id);
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
  return $(container.parent('.container'));
}

var get_siblings = function(container){
  var children = container.children('.container')
  var c = {};
  c.a = $(children[0]);
  c.b = $(children[1]);
  return c;
}

var get_other_sibling = function(container){
  var parent = get_parent(container);
  var siblings = get_siblings(parent);
  var other_sibling = container.hasClass('a') ? siblings.b : siblings.a;
  return other_sibling
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
  });

  $('#page').mouseup(function(){
    $('.values').hide();
  });

  //  container
  $('.simple.container').live('mouseover', function(){
  });

  $('.container').live('mouseout', function(){
    $('.buttons').hide();
  });

  $('.simple.container.ce').live('mouseover', function(d){
    $('.header').removeClass('hover');
    $('.header', this).addClass('hover');
    $('.square').hide();
    $('.square', this).show();
  })

  // box
  $('.box').live('mouseover', function(){
    // $('.triangle').hide();
    // $('.triangle', this).show();
  });

  $('.box').live('mouseout', function(){
  });

  $('.box').live('click', function(d){
    var click = {};
    click.y = d.pageY;
    click.x = d.pageX;

    var box = {};
    box.jq = $(this);
    box.offset = box.jq.offset();
    box.y = box.offset.top;
    box.x = box.offset.left;
    box.width = parseInt(box.jq.css('width'));
    box.height = parseInt(box.jq.css('height'));
    box.o = {};
    box.o.x = box.width / 2 + box.x;
    box.o.y = box.height /2 + box.y;

    // corrected values
    click.pos = {};
    click.pos.x = click.x - box.o.x;
    click.pos.y = box.o.y - click.y;

    // regions
    if        ((click.pos.y > 0) && (click.pos.y > (box.height / box.width) * Math.abs(click.pos.x))) {
      // console.log('region 1');
    } else if ((click.pos.x > 0) && (click.pos.x > (box.height / box.width) * Math.abs(click.pos.y))) {
      // console.log('region 2');
    } else if ((click.pos.y < 0) && (click.pos.y < (box.height / box.width) * Math.abs(click.pos.x))) {
      // console.log('region 3');
    } else if ((click.pos.x < 0) && (click.pos.x < (box.height / box.width) * Math.abs(click.pos.y))) {
      // console.log('region 4');
    } else {
      // console.log('shit');
    }

    // console.log('click: ' + click.y + " " + click.x);
    // console.log('box: ' + box.y + " " + box.x);
    // console.log('box: ' + box.width + " " + box.height);
    // console.log('box o: ' + box.o.x + " " + box.o.y)
    // console.log('click c: ' + click.pos.x + " " + click.pos.y)
  })

  // content
  $('.body .content').live('mouseup', function(){
    var sel = window.getSelection();
    text_selection = !sel.isCollapsed ? sel : null;
  });

  // header / menubar
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

  var buttons = $('.dropdown .arrows, .dropdown .down-arrow, #colors');
  buttons.live('click', function(){
    $('.values').hide();
    $(this).parent().find('.values').show();
  })
<<<<<<< HEAD
=======
  

  $('#styles-button, #styles-dropdown').live('click', function(){
    $('.values').hide();
    $(this).find('.values').show()
  })
  
  $('.font.dropdown .values li').live('click', function(){
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('.selected.option');
    parent.text(value);
    $('.values').hide();
  })
  
  $('.font-size.dropdown .values li').live('click', function(){
    var value = $(this).text();
    var parent = $(this).closest('.dropdown').find('input');
    parent.val(value);
    $('.values').hide();
  })
  
  var colors = $('.toolbar .colors ul.base li, .toolbar .colors ul.theme li');
  colors.live('mouseup', function(){
    var color = $(this).css('background-color');
    $('#colors').css('background-color', color);    
  })
>>>>>>> a0780991d011bd1587436b4e61ea18e5bfce37a4

  // container & boxes
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

    // var container = $($(this).closest('.container'));
    // var other_container = get_other_sibling(container);

    var triangle_y_position = d.pageY;
    var triangle_x_position = d.pageX;

    var body = $(this).closest('.body');
    var body_height = parseInt(body.css('height'));
    var body_width = parseInt(body.css('width'));

    var right_square = body.find('.square.right');
    var left_square = body.find('.square.left');
    var bottom_square = body.find('.square.bottom');

    var buffer_y_position = triangle_y_position - body_height;
    var buffer_x_position = triangle_x_position - body_width;

    $('#page, .box, .header, ul, li, .content, .body')
      .addClass('triangle_on');

    $('#page').bind('mousemove', function(e){
      var current_y_position = e.pageY;
      var current_x_position = e.pageX;

      var old_height = body_height;
      var old_width = body_width;

      body_height = current_y_position - buffer_y_position;
      body_width = current_x_position - buffer_x_position;

      body.css('min-height', body_height)

      left_square.css('top', body_height / 2);
      right_square.css('top', body_height / 2);
      bottom_square.css('right', body_width / 2);
      // container.css('width', body_width);
      // resize_container((body_width - old_width), other_container)
      // console.log((body_height - old_height) + " " + (body_width - old_width))


    });
  })

  $('.square').live('mouseover', function(){
    $(this).css('background-color', '#8eb4e3')
  });

  $('.square').live('mouseout', function(){
    $('.square').css('background-color', '#fff')
  });

}

<<<<<<< HEAD
var fixSquarePosition = function(){
  // squares
  $('.simple.container').each(function(){
    var container = $(this);
    var squares = container.find('.square');
    var y_pos = container.height() / 2;
    var x_pos = container.width() / 2;

    squares.filter('.left').css('top', y_pos);
    squares.filter('.right').css('top', y_pos);
    squares.filter('.bottom').css('right', x_pos);
  })
=======
var load_page = function(json){
  var root = json.root;
  var content = load(root, json);
 
  set_page_title(json.title);
  $('#page')
    .html(content)
    .append(clear_div());
}

// sample content
var e1 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}
var e2 = {"box":{"1":{"width":1000,"content":"","min_height":200,"id":1}},"container":{"1":{"type":"simple","b_child":null,"a_child":1,"position":"a","id":1}},"root":1}
var e3 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}

var text = '<span class="f16 c4">L</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4">e</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">i</span><span class="f16 c4">p</span><span class="f16 c4">s</span><span class="f16 c4">u</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">d</span><span class="f16 c4">o</span><span class="f16 c4">l</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4"> </span><span class="f16 c4">s</span><span class="f16 c4">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">g</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">i</span><span class="f13 c3">u</span><span class="f13 c3">s</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">m</span><span class="f13 c3">p</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">a</span><span class="f13 c3">g</span><span class="f13 c3">n</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">U</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">i</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">m</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">D</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">h</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3"> </span><span class="f13 c3">f</span><span class="f13 c3">u</span><span class="f13 c3">g</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">E</span><span class="f13 c3">x</span><span class="f13 c3">c</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">c</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">o</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">f</span><span class="f13 c3">f</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3">.</span>'

//

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

var fix_toolbar = function(){
   var msie6 = $.browser == 'msie' && $.browser.version < 7;
   if (!msie6) {
     var top = $('.toolbar').offset().top - parseFloat($('.toolbar').css('margin-top').replace(/auto/, 0));
     var left = $('#page').offset().left;
     $(window).scroll(function (event) {
       console.log('hello');
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


// preview mode

var grey_text = $('span class="f16 c12"').text('lorem ipsum')

var preview_mode = function(){
  $('#page, .box, .header, .body, .divider, .triangle').addClass('preview')
  $('.header').hide()
  $('.triangle').hide()
  $('.content').attr('content-editable', 'false')
}

var edit_mode = function(){
  $('#page, .box, .header, .body, .divider, .triangle').removeClass('preview')
  $('.header').show()
  $('.triangle').show()
  $('.content').attr('content-editable', 'true')
>>>>>>> a0780991d011bd1587436b4e61ea18e5bfce37a4
}
