path = require 'path'

module.exports = class Blob
  constructor: (@repo, attrs) ->
    {@id, @name, @mode} = attrs
  
  # Public: Get the blob contents.
  # 
  # callback - Receives `(err, data)`.
  # 
  data: (callback) ->
    @repo.git "cat-file", {p: true}, @id
    , (err, stdout, stderr) ->
      return callback err, stdout
  
  toString: ->
    "#<Blob '#{@id}'>"
