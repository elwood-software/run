


CREATE TABLE @extschema@.run_workflow (
  instance_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NULL,
  configuration JSONB NULL,
  metadata JSONB NULL,
  version SMALLINT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT run_workflow_pkey PRIMARY KEY (id),
  CONSTRAINT idx_elwood_run_workflow_name UNIQUE (instance_id, name, version)
);

CREATE TABLE @extschema@.run (
  instance_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  id SERIAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  summary TEXT NULL,
  short_summary CHARACTER VARYING (255) NULL,
  workflow_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'::TEXT,
  result CHARACTER VARYING NULL DEFAULT 'none'::CHARACTER VARYING,
  tracking_id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  report JSONB NOT NULL DEFAULT '{}'::JSONB,
  num INTEGER NULL DEFAULT 0,
  metadata JSONB NULL DEFAULT '{}'::JSONB,
  variables JSONB NULL DEFAULT '{}'::JSONB,
  started_at TIMESTAMP WITH TIME ZONE NULL,
  ended_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT run_pkey PRIMARY KEY (id),
  CONSTRAINT idx_elwood_run_tracking_id UNIQUE (tracking_id),
  CONSTRAINT elwood_run_workflow_id
    FOREIGN KEY (workflow_id) REFERENCES apollo.run_workflow (id)
);

CREATE TABLE @extschema@.run_event (
  instance_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  id SERIAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type TEXT NULL,
  tracking_id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT run_event_pkey PRIMARY KEY (id)
);

CREATE VIEW public.elwood_run AS
  SELECT
    run.instance_id,
    run.id,
    run.created_at,
    run.summary,
    run.short_summary,
    run.workflow_id,
    run.status,
    run.result,
    run.tracking_id,
    run.report,
    run.num,
    run.metadata,
    run.variables,
    run.started_at,
    run.ended_at,
    (
      SELECT
        run_workflow.configuration
      FROM @extschema@.run_workflow
      WHERE run_workflow.id = run.workflow_id
    ) AS configuration
  FROM @extschema@.run;

CREATE VIEW public.elwood_run_event AS
  SELECT
    run_event.id,
    run_event.created_at,
    run_event.type,
    run_event.tracking_id,
    run_event.data
  FROM @extschema@.run_event;
