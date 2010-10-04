class AddRootToPage < ActiveRecord::Migration
  def self.up
    add_column :pages, :root, :integer
  end

  def self.down
    remove_column :pages, :root
  end
end
