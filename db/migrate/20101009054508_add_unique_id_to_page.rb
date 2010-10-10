class AddUniqueIdToPage < ActiveRecord::Migration
  def self.up
    add_column :pages, :unique_id, :string
  end

  def self.down
    remove_column :pages, :unique_id
  end
end
