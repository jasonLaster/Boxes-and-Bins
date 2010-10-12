class AddAuthorToPages < ActiveRecord::Migration
  def self.up
    add_column :pages, :author, :string
  end

  def self.down
    remove_column :pages, :author
  end
end
