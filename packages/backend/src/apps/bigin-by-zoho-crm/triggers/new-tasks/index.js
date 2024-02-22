import Crypto from 'crypto';
import defineTrigger from '../../../../helpers/define-trigger.js';

export default defineTrigger({
  name: 'New tasks',
  key: 'newTasks',
  type: 'webhook',
  description: 'Triggers when a new task is created.',
  arguments: [
    {
      label: 'Organization',
      key: 'organizationId',
      type: 'dropdown',
      required: true,
      description: '',
      variables: false,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listOrganizations',
          },
        ],
      },
    },
  ],

  async run($) {
    const dataItem = {
      raw: $.request.body,
      meta: {
        internalId: Crypto.randomUUID(),
      },
    };

    $.pushTriggerItem(dataItem);
  },

  async testRun($) {
    const organizationId = $.step.parameters.organizationId;

    const sampleEventData = {
      ids: ['111111111111111111'],
      token: null,
      module: 'Tasks',
      operation: 'insert',
      channel_id: organizationId,
      server_time: 1708426963120,
      query_params: {},
      resource_uri: `${$.auth.data.apiDomain}/bigin/v1/Tasks`,
      affected_fields: [],
    };

    const dataItem = {
      raw: sampleEventData,
      meta: {
        internalId: sampleEventData.channel_id,
      },
    };

    $.pushTriggerItem(dataItem);
  },

  async registerHook($) {
    const organizationId = $.step.parameters.organizationId;

    const payload = {
      watch: [
        {
          channel_id: organizationId,
          notify_url: $.webhookUrl,
          events: ['Tasks.create'],
        },
      ],
    };

    await $.http.post('/bigin/v2/actions/watch', payload);

    await $.flow.setRemoteWebhookId(organizationId);
  },

  async unregisterHook($) {
    await $.http.delete(
      `/bigin/v2/actions/watch?channel_ids=${$.flow.remoteWebhookId}`
    );
  },
});