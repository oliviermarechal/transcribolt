

CREATE TABLE transcription_request (
   id uuid NOT NULL,
   email VARCHAR ( 100 ) NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   checkout_id VARCHAR ( 100 ) DEFAULT NULL,
   order_id VARCHAR ( 100 ) DEFAULT NULL,
   price NUMERIC(10, 2) NOT NULL,
   status VARCHAR ( 100 ) DEFAULT NULL,
   PRIMARY KEY(id)
);

CREATE TABLE transcription_request_item (
    id uuid NOT NULL,
    transcription_id uuid NOT NULL,
    file_name VARCHAR ( 100 ) NOT NULL,
    output_format VARCHAR ( 100 ) NOT NULL,
    timestamp_granularity VARCHAR ( 100 ) DEFAULT NULL,
    PRIMARY KEY(id),
    CONSTRAINT fk_request_item
        FOREIGN KEY (transcription_id)
            REFERENCES transcription_request(id)
);