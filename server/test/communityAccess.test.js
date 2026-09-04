const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canViewComment,
  canViewMoment,
  canViewNotification,
} = require('../src/services/communityAccess');

const context = overrides => ({
  viewerId: 'viewer',
  blockedIds: new Set(),
  buddyIds: new Set(),
  followedIds: new Set(),
  reportedMomentIds: new Set(),
  reportedCommentIds: new Set(),
  ...overrides,
});

const moment = (visibility = 'public') => ({
  id: 1,
  visibility,
  author: { userId: 'author' },
});

test('moment visibility respects owner, buddy, block, and report rules', () => {
  assert.equal(canViewMoment(moment('public'), context()), true);
  assert.equal(canViewMoment(moment('private'), context()), false);
  assert.equal(
    canViewMoment(
      moment('buddies'),
      context({ buddyIds: new Set(['author']) }),
    ),
    true,
  );
  assert.equal(
    canViewMoment(
      moment('public'),
      context({ blockedIds: new Set(['author']) }),
    ),
    false,
  );
  assert.equal(
    canViewMoment(
      moment('public'),
      context({ reportedMomentIds: new Set([1]) }),
    ),
    false,
  );
  assert.equal(
    canViewMoment(
      { ...moment('private'), author: { userId: 'viewer' } },
      context(),
    ),
    true,
  );
});

test('comment and notification visibility reuse block, report, and moment rules', () => {
  assert.equal(
    canViewComment({ id: 2, user: { userId: 'author' } }, context()),
    true,
  );
  assert.equal(
    canViewComment(
      { id: 2, user: { userId: 'author' } },
      context({ reportedCommentIds: new Set([2]) }),
    ),
    false,
  );

  const moments = new Map([['1', moment('buddies')]]);
  assert.equal(
    canViewNotification(
      { targetType: 'moment', targetId: 1 },
      context({ buddyIds: new Set(['author']) }),
      moments,
    ),
    true,
  );
  assert.equal(
    canViewNotification(
      { targetType: 'moment', targetId: 1 },
      context(),
      moments,
    ),
    false,
  );
  assert.equal(
    canViewNotification(
      { sender: { userId: 'author' }, targetType: 'buddy' },
      context({ blockedIds: new Set(['author']) }),
      moments,
    ),
    false,
  );
});
