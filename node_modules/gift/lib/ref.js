(function() {
  var Commit, Head, Ref, fs;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  Commit = require('./commit');

  exports.Ref = Ref = (function() {

    function Ref(name, commit) {
      this.name = name;
      this.commit = commit;
      this.repo = this.commit.repo;
    }

    Ref.prototype.toString = function() {
      return "#<Ref '" + this.name + "'>";
    };

    Ref.find_all = function(repo, type, RefClass, callback) {
      return repo.git.refs(type, {}, function(err, text) {
        var id, ids, name, names, ref, _i, _len, _ref, _ref2;
        if (err) return callback(err);
        names = [];
        ids = [];
        _ref = text.split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ref = _ref[_i];
          if (!ref) continue;
          _ref2 = ref.split(' '), name = _ref2[0], id = _ref2[1];
          names.push(name);
          ids.push(id);
        }
        return Commit.find_commits(repo, ids, function(err, commits) {
          var i, name, refs, _len2;
          if (err) return callback(err);
          refs = [];
          for (i = 0, _len2 = names.length; i < _len2; i++) {
            name = names[i];
            refs.push(new RefClass(name, commits[i]));
          }
          return callback(null, refs);
        });
      });
    };

    return Ref;

  })();

  exports.Head = Head = (function() {

    __extends(Head, Ref);

    function Head() {
      Head.__super__.constructor.apply(this, arguments);
    }

    Head.find_all = function(repo, callback) {
      return Ref.find_all(repo, "head", Head, callback);
    };

    Head.current = function(repo, callback) {
      return fs.readFile("" + repo.dot_git + "/HEAD", function(err, data) {
        var branch, m, _ref;
        if (err) return callback(err);
        _ref = /ref: refs\/heads\/([^\s]+)/.exec(data), m = _ref[0], branch = _ref[1];
        return fs.readFile("" + repo.dot_git + "/refs/heads/" + branch, function(err, id) {
          return Commit.find(repo, id, function(err, commit) {
            if (err) return callback(err);
            return callback(null, new Head(branch, commit));
          });
        });
      });
    };

    return Head;

  })();

}).call(this);
