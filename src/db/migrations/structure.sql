--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 14.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Players" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "minaPublicKey" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Players" OWNER TO postgres;

--
-- Name: Players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Players_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Players_id_seq" OWNER TO postgres;

--
-- Name: Players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Players_id_seq" OWNED BY public."Players".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Players" ALTER COLUMN id SET DEFAULT nextval('public."Players_id_seq"'::regclass);


--
-- Data for Name: Players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Players" (id, name, "minaPublicKey", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	New Guy	somekey	2023-02-21 21:33:12.748-05	2023-02-21 21:33:12.748-05	\N
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20230222021826-create-player.js
\.


--
-- Name: Players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Players_id_seq"', 1, true);


--
-- Name: Players Players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Players"
    ADD CONSTRAINT "Players_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- PostgreSQL database dump complete
--

