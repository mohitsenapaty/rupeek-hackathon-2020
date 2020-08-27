CREATE TABLE investor (
    "createdAt" character varying,
    "updatedAt" character varying,
    id integer NOT NULL,
    refid text,
    pass text,
    phone text
);

CREATE SEQUENCE investor_id_seq;

ALTER SEQUENCE investor_id_seq OWNED BY investor.id;

ALTER TABLE ONLY investor ALTER COLUMN id SET DEFAULT nextval('investor_id_seq'::regclass);

CREATE TABLE investmenttochunk (
    "createdAt" character varying,
    "updatedAt" character varying,
    id integer NOT NULL,
    investmentid integer NOT NULL,
    chunkid integer NOT NULL,
    schemeinterest real,
    amount real,
    earning real
);

CREATE SEQUENCE investmenttochunk_id_seq;

ALTER SEQUENCE investmenttochunk_id_seq OWNED BY investmenttochunk.id;

ALTER TABLE ONLY investmenttochunk ALTER COLUMN id SET DEFAULT nextval('investmenttochunk_id_seq'::regclass);

CREATE TABLE investment (
    "createdAt" character varying,
    "updatedAt" character varying,
    id integer NOT NULL,
    investor integer NOT NULL,
    amount real NOT NULL,
    investedon timestamp,
    closedon timestamp,
    fetchedon timestamp,
    returntotal real,
    roimaxlimit real,
    status text
);

CREATE SEQUENCE investment_id_seq;

ALTER SEQUENCE investment_id_seq OWNED BY investment.id;

ALTER TABLE ONLY investment ALTER COLUMN id SET DEFAULT nextval('investment_id_seq'::regclass);

CREATE TABLE loan (
    "createdAt" character varying,
    "updatedAt" character varying,
    id integer NOT NULL,
    loanid text NOT NULL,
    loanamount real NOT NULL,
    balanceamount real NOT NULL,
    tenure integer,
    startedon timestamp,
    expirydate timestamp,
    fetchedon timestamp,
    closedon timestamp,
    scheme real,
    residueamount real,
    status text
);

CREATE SEQUENCE loan_id_seq;

ALTER SEQUENCE loan_id_seq OWNED BY loan.id;

ALTER TABLE ONLY loan ALTER COLUMN id SET DEFAULT nextval('loan_id_seq'::regclass);

CREATE TABLE chunk (
    "createdAt" character varying,
    "updatedAt" character varying,
    id integer NOT NULL,
    loan integer NOT NULL,
    interestrate real NOT NULL,
    invested boolean,
    closed boolean,
    investedon timestamp,
    fetchedon timestamp,
    closedon timestamp,
    currentinterestrate real,
    status text
);

CREATE SEQUENCE chunk_id_seq;

ALTER SEQUENCE chunk_id_seq OWNED BY chunk.id;

ALTER TABLE ONLY chunk ALTER COLUMN id SET DEFAULT nextval('chunk_id_seq'::regclass);

