class PagesController < ApplicationController

  before_filter :login_required, :only => [:load]


  def new
    @user = User.find_by_id(params[:user_id])
    @page = Page.create({'user_id'=>@user.id, 'title'=> ""})
  end

  def index
    @user = User.find_by_id(params[:user_id])
    @pages = @user.pages
  end

  def show
    @user = User.find_by_id(params[:user_id])
    @page = Page.find_by_id(params[:page_id])
  end
  
  
  def doc
  end
  

  def load
    @user = User.find_by_id(params[:user_id])
    @page = Page.find_by_id(params[:page_id])
    @content = @page.load
    render :json => @content
  end
  
  def save
    j = ActiveSupport::JSON
    @user = User.find_by_id(params[:user_id])
    @page = Page.find_by_id(params[:page_id])
    @data = j.decode(params['data'])
    @boxes = @data['box']
    @containers = @data['container']

    
    @page.containers.destroy_all
    @page.boxs.destroy_all
    @page.root = @data['root_id']
    @page.title = @data['page_title']
    @page.save 
    

    @boxes.each do |key, box|
      b = Box.new
      b.b_id = box['id']
      b.page_id = params[:page_id]
      b.width = box['width']
      b.min_height = box['min_height']
      b.content = box['content']
      b.save
    end
    
    @containers.each do |key, container|
      c = Container.new
      c.page_id = params[:page_id]
      c.c_type = container['type']
      c.a_child = container['a_child']
      c.b_child = container['b_child']
      c.c_id = container['id']
      c.c_position = container['position']
      c.save
    end
    

    
    render :json => ""

  end
  
end
