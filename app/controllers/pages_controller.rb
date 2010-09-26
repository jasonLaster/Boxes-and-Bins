class PagesController < ApplicationController

  def index
    @user = User.find_by_id(params[:user_id])
    @pages = @user.pages
  end

  def show
    @user = User.find_by_id(params[:user_id])
    @page = Page.find_by_id(params[:page_id])
  end
  
end
