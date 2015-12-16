import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
import provisionGit from '../src/';
import repositoryQuestion from 'packagesmith.questions.repository';
describe('provisionGit', () => {

  it('is a function', () => {
    provisionGit.should.be.a('function');
  });

  it('returns an object', () => {
    provisionGit().should.be.an('object');
  });

  describe('.git property', () => {

    it('is present when {init: true} passed', () => {
      provisionGit({ init: true }).should.have.property('.git');
    });

    it('is not present when {init: false} passed', () => {
      provisionGit({ init: false }).should.not.have.property('.git');
    });

    it('defaults to being present if `init` not given', () => {
      provisionGit().should.have.property('.git');
    });

  });

  describe('.git/config', () => {

    it('is present when `setupGitConfig` is true', () => {
      provisionGit({ setupGitConfig: true }).should.have.property('.git/config');
    });

    it('is not present when `setupGitConfig` is false', () => {
      provisionGit({ setupGitConfig: false }).should.not.have.property('.git/config');
    });

    it('defaults `setupGitConfig` to true', () => {
      provisionGit().should.have.property('.git/config');
    });

    it('has a repository question in questions', () => {
      provisionGit()
        .should.have.property('.git/config')
          .that.has.property('questions')
            .that.has.lengthOf(1);
      provisionGit()['.git/config'].questions[0].name.should.equal('repository');
      provisionGit()['.git/config'].questions[0].when.toString().should.equal(repositoryQuestion().when.toString());
    });

    it('has contents function', () => {
      provisionGit()
        .should.have.property('.git/config')
          .that.has.property('contents')
            .that.is.a('function');
    });

    describe('contents function', () => {
      let gitconfigContents = null;
      beforeEach(() => {
        gitconfigContents = provisionGit()['.git/config'].contents;
      });

      it('sets [remote "origin"].url to answers.repository', () => {
        gitconfigContents('', {
          repository: 'git@example.com:foo/bar.git',
        }).should.equal(
`[remote "origin"]
url = git@example.com:foo/bar.git
fetch = +refs/heads/*:refs/remotes/origin/*
`);
      });

      it('extends given contents', () => {
        const contents = '[core]\neditor=foo\n[remote "upstream"]\nurl=foo';
        gitconfigContents(contents, { repository: 'git@example.com:foo/bar.git' }).should.equal(
`[core]
editor = foo

[remote "upstream"]
url = foo

[remote "origin"]
url = git@example.com:foo/bar.git
fetch = +refs/heads/*:refs/remotes/origin/*
`);
      });

      it('allows original config to take precedence', () => {
        const contents = '[remote "origin"]\nurl=foo\nfetch=bar';
        gitconfigContents(contents, { repository: 'git@example.com:foo/bar.git' }).should.equal(
`[remote "origin"]
url = foo
fetch = bar
`);
      });

    });

  });


});
