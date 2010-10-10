class AddVersionToPages < ActiveRecord::Migration
  def self.up
    add_column :boxes, :version, :integer
    add_column :containers, :version, :integer
  end

  def self.down
    remove_column :boxes, :version
    remove_column :containers, :version
  end
end
