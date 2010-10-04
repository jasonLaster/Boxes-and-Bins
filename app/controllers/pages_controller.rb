class PagesController < ApplicationController

  before_filter :login_required, :only => [:show, :load]



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
    # @user = User.find_by_id(params[:user_id])
    # @page = Page.find_by_id(params[:page_id])
    # @data = params[:data]
    
    puts "\n"*10
    puts "yay"
    # puts @data.inspect

  end
  
end
