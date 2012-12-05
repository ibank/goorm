should = require 'should'
git    = require '../src'
Repo   = require '../src/repo'

describe "git", ->
  describe "()", ->
    repo = git "#{__dirname}/fixtures/simple"
    
    it "returns a Repo", ->
      repo.should.be.an.instanceof Repo
