class PagesController < ApplicationController

  # before_filter :login_required, :only => []

  def index
    @uid = params[:uid]
    
    if @uid
      # load page
      @page = Page.find_by_uid(@uid)
      
      # get content
      j = ActiveSupport::JSON
      @content = load_page(@page)
      @content = j.encode(@content)

      
      puts "\n"*5 + "rendered page with uid: " + @page.uid
      puts @content
      puts @uid
    else

      @page = Page.new
      @page.uid = Page.create_uid
      @page.title = "Page Title"
      @page.save  
      
      @page.copy_content
      puts "\n"*5 + "created content!!!"

      # redirect to index_path(:uid => @page.an_id)
      redirect_to index_path :uid => @page.uid
      
    end
    
  end

  def new
    @user = User.find_by_id(params[:user_id])
    @page = Page.create({'user_id'=>@user.id, 'title'=> ""})
  end

  def acct
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
    @content = load_page(@page)

    puts "\n"*5 + "load data"
    puts @content.inspect
    
    render :json => @content
  end
  
  def save
    user_id = params[:user_id]
    page_id = params[:page_id]
    uid = params[:uid]

    j = ActiveSupport::JSON
    @data = j.decode(params['data'])
    @page = uid ? Page.find_by_uid(uid) : Page.find(page_id)


    puts "\n"*5 + "start save"
    puts @data.inspect
    save_page(@data, @page)

    puts "\n"*5 + "save"
    puts @data.inspect
    puts @page.inspect
        
    render :json => ""

  end
  
  protected
  
  def load_page (page)
    boxes = page.boxs
    boxes.map! {|i| {:id => i.b_id, :width => i.width, :min_height => i.min_height, :content => i.content}}
    boxes_h = Hash.new
    boxes.each {|i| boxes_h[i[:id]] = i}

    containers = page.containers
    containers.map! {|i| {:id => i.c_id, :type => i.c_type, :position => i.c_position, :a_child => i.a_child, :b_child => i.b_child}} 
    containers_h = Hash.new
    containers.each {|i| containers_h[i[:id]] = i}
    
    root = page.root
    title = page.title
    
    {:box => boxes_h, :container => containers_h, :root => root, :title => title}
  end
    
  def save_page (data, page)
    boxes = @data['box']
    containers = @data['container']
    version = page.get_version
    
    # create new boxes
    boxes.each do |key, box|
      b = Box.new
      b.version = version + 1
      b.b_id = box['id']
      b.page_id = page.id
      b.width = box['width']
      b.min_height = box['min_height']
      b.content = box['content']
      b.save
    end
    
    # create new containers
    containers.each do |key, container|
      c = Container.new
      c.page_id = page.id
      c.version = version + 1
      c.c_type = container['type']
      c.a_child = container['a_child']
      c.b_child = container['b_child']
      c.c_id = container['id']
      c.c_position = container['position']
      c.save
    end
    
    # update page
    page.root = data['root_id']
    page.title = data['page_title']
    page.save       
  end
   
end
