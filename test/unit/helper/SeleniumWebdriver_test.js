'use strict';
let SeleniumWebdriver = require('../../../lib/helper/SeleniumWebdriver');
let should = require('chai').should();
let I, browser;
let site_url = 'http://127.0.0.1:8000';
let assert = require('assert');
let path = require('path');
let fs = require('fs');
let fileExists = require('../../../lib/utils').fileExists;
let AssertionFailedError = require('../../../lib/assert/error');
let formContents = require('../../../lib/utils').test.submittedData(path.join(__dirname, '../../data/app/db'));
let expectError = require('../../../lib/utils').test.expectError;
require('co-mocha')(require('mocha'));
let webApiTests = require('./webapi');

describe('SeleniumWebdriver', function () {
  this.timeout(10000);

  before(function() {
    global.codecept_dir = path.join(__dirname, '../../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {}

    I = new SeleniumWebdriver({
      url: site_url,
      browser: 'firefox'
    });
    I._init();
  });

  beforeEach(function() {
    webApiTests.init({ I, site_url});
    return browser = I._before();
  });

  afterEach(() => {
    return I._after();
  });

  describe('open page : #amOnPage', () => {
    it('should open main page of configured site', function*() {
      I.amOnPage('/');
      let url = yield browser.getCurrentUrl();
      return url.should.eql(site_url + '/');
    });

    it('should open any page of configured site', function*() {
      I.amOnPage('/info');
      let url = yield browser.getCurrentUrl();
      return url.should.eql(site_url + '/info');
    });

    it('should open absolute url', function*() {
      I.amOnPage(site_url);
      let url = yield browser.getCurrentUrl();
      return url.should.eql(site_url + '/');
    });
  });

  webApiTests.tests();

  describe('see text : #see', () => {
    it('should fail when text is not on site', () => {
      return I.amOnPage('/')
        .then(() => I.see('Something incredible!'))
        .then(expectError)
        .thenCatch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web application');
        })
    });

    it('should fail when text on site', () => {
      return I.amOnPage('/')
        .then(() => I.dontSee('Welcome'))
        .then(expectError)
        .thenCatch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web application');
        });
    });

    it('should fail when test is not in context', () => {
      return I.amOnPage('/')
        .then(() => I.see('debug', {css: 'a'}))
        .then(expectError)
        .thenCatch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.toString().should.not.include('web page');
          e.inspect().should.include("expected element {css: 'a'}");
        });
    });
  });

});