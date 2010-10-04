class RenameTypeInContainer < ActiveRecord::Migration
  def self.up
    rename_column :containers, :type, :c_type

  end

  def self.down
    rename_column :containers, :c_type, :type
  end
end
