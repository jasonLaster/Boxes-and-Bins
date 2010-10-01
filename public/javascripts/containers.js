
var box = (function(){

  self.set_attributes = function(){
    var a = {};
    a.id = 0;
    a.width = 400;
    a.min_height = 400;
    return a;
  }



  self.new = function(attr){

    var set_attributes = function(){
      properties = {};
      properties.page_id = page.get_id();
      properties.id = self.new_id();
      properties.parent_id = attr.parent_id || 0;
      properties.type = 'text';
      properties.width = attr.width || self.attr.width;
      properties.min_height = attr.min_height || self.attr.min_height; 
      properties.content = attr.content || "";
      return properties;
    }

    var set_html = function(){

      var box_html = function(){
        return $('<div class="box">');
      }

      var header_html = function(){
        return $('<div class="buffer_header">')
          .append($('<div class="remove_button">'))
          .append($('<ul class="buttons">')
            .append($('<li class="button left">').html('&larr;'))
            .append($('<li class="button right">').html('&rarr;'))
            .append($('<li class="button up">').html('&uarr;'))
            .append($('<li class="button down">').html('&darr;'))
          )
          .append($('<div class="clear">'));
      }

      var body_html = function(){
        return $('<div class="body">')
          .append('<div class="content">')
      }

      return header();
    }

    var a_box = {};
    a_box.attr = set_attributes();
    a_box.html = set_html();
    return a_box;
  };


  self.new_id = function(){
    return ++self.attr.id;
  };


  self.attr = set_attributes()

  return self;
})();



var page = (function(){

  self.get_id = function(){
    return 1;
  }

  return self;
})();


var container = (function(){


  return self;
})();