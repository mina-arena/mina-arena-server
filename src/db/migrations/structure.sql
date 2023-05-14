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

--
-- Name: enum_GamePhases_phase; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_GamePhases_phase" AS ENUM (
    'movement',
    'shooting',
    'melee'
);


ALTER TYPE public."enum_GamePhases_phase" OWNER TO postgres;

--
-- Name: enum_GamePieceActions_actionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_GamePieceActions_actionType" AS ENUM (
    'move',
    'rangedAttack',
    'meleeAttack'
);


ALTER TYPE public."enum_GamePieceActions_actionType" OWNER TO postgres;

--
-- Name: enum_Games_phase; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Games_phase" AS ENUM (
    'movement',
    'shooting',
    'melee'
);


ALTER TYPE public."enum_Games_phase" OWNER TO postgres;

--
-- Name: enum_Games_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Games_status" AS ENUM (
    'pending',
    'inProgress',
    'completed',
    'canceled'
);


ALTER TYPE public."enum_Games_status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: GameArenas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GameArenas" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GameArenas" OWNER TO postgres;

--
-- Name: GameArenas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GameArenas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GameArenas_id_seq" OWNER TO postgres;

--
-- Name: GameArenas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GameArenas_id_seq" OWNED BY public."GameArenas".id;


--
-- Name: GamePhases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GamePhases" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "gamePlayerId" integer NOT NULL,
    "turnNumber" integer NOT NULL,
    phase public."enum_GamePhases_phase" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GamePhases" OWNER TO postgres;

--
-- Name: GamePhases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GamePhases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GamePhases_id_seq" OWNER TO postgres;

--
-- Name: GamePhases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GamePhases_id_seq" OWNED BY public."GamePhases".id;


--
-- Name: GamePieceActions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GamePieceActions" (
    id integer NOT NULL,
    "gamePhaseId" integer NOT NULL,
    "gamePlayerId" integer NOT NULL,
    "gamePieceId" integer NOT NULL,
    "actionType" public."enum_GamePieceActions_actionType" NOT NULL,
    "actionData" jsonb NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GamePieceActions" OWNER TO postgres;

--
-- Name: GamePieceActions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GamePieceActions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GamePieceActions_id_seq" OWNER TO postgres;

--
-- Name: GamePieceActions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GamePieceActions_id_seq" OWNED BY public."GamePieceActions".id;


--
-- Name: GamePieces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GamePieces" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "gamePlayerId" integer NOT NULL,
    "playerUnitId" integer NOT NULL,
    "positionX" integer,
    "positionY" integer,
    health integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GamePieces" OWNER TO postgres;

--
-- Name: GamePieces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GamePieces_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GamePieces_id_seq" OWNER TO postgres;

--
-- Name: GamePieces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GamePieces_id_seq" OWNED BY public."GamePieces".id;


--
-- Name: GamePlayers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GamePlayers" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "playerId" integer NOT NULL,
    "playerNumber" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GamePlayers" OWNER TO postgres;

--
-- Name: GamePlayers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GamePlayers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GamePlayers_id_seq" OWNER TO postgres;

--
-- Name: GamePlayers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GamePlayers_id_seq" OWNED BY public."GamePlayers".id;


--
-- Name: Games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Games" (
    id integer NOT NULL,
    status public."enum_Games_status" NOT NULL,
    "turnNumber" integer,
    phase public."enum_Games_phase",
    "turnPlayerOrder" character varying(255),
    "turnGamePlayerId" integer,
    "winningGamePlayerId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Games" OWNER TO postgres;

--
-- Name: Games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Games_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Games_id_seq" OWNER TO postgres;

--
-- Name: Games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Games_id_seq" OWNED BY public."Games".id;


--
-- Name: PlayerUnits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PlayerUnits" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "playerId" integer NOT NULL,
    "unitId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PlayerUnits" OWNER TO postgres;

--
-- Name: PlayerUnits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PlayerUnits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PlayerUnits_id_seq" OWNER TO postgres;

--
-- Name: PlayerUnits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PlayerUnits_id_seq" OWNED BY public."PlayerUnits".id;


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
-- Name: Units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Units" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "maxHealth" integer NOT NULL,
    "movementSpeed" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "armorSaveRoll" integer DEFAULT 6 NOT NULL,
    "meleeNumAttacks" integer DEFAULT 1 NOT NULL,
    "meleeHitRoll" integer DEFAULT 4 NOT NULL,
    "meleeWoundRoll" integer DEFAULT 4 NOT NULL,
    "meleeArmorPiercing" integer DEFAULT 0 NOT NULL,
    "meleeDamage" integer DEFAULT 1 NOT NULL,
    "rangedRange" integer,
    "rangedNumAttacks" integer,
    "rangedHitRoll" integer,
    "rangedWoundRoll" integer,
    "rangedArmorPiercing" integer,
    "rangedDamage" integer,
    "rangedAmmo" integer
);


ALTER TABLE public."Units" OWNER TO postgres;

--
-- Name: Units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Units_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Units_id_seq" OWNER TO postgres;

--
-- Name: Units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Units_id_seq" OWNED BY public."Units".id;


--
-- Name: GameArenas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GameArenas" ALTER COLUMN id SET DEFAULT nextval('public."GameArenas_id_seq"'::regclass);


--
-- Name: GamePhases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePhases" ALTER COLUMN id SET DEFAULT nextval('public."GamePhases_id_seq"'::regclass);


--
-- Name: GamePieceActions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePieceActions" ALTER COLUMN id SET DEFAULT nextval('public."GamePieceActions_id_seq"'::regclass);


--
-- Name: GamePieces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePieces" ALTER COLUMN id SET DEFAULT nextval('public."GamePieces_id_seq"'::regclass);


--
-- Name: GamePlayers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePlayers" ALTER COLUMN id SET DEFAULT nextval('public."GamePlayers_id_seq"'::regclass);


--
-- Name: Games id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Games" ALTER COLUMN id SET DEFAULT nextval('public."Games_id_seq"'::regclass);


--
-- Name: PlayerUnits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlayerUnits" ALTER COLUMN id SET DEFAULT nextval('public."PlayerUnits_id_seq"'::regclass);


--
-- Name: Players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Players" ALTER COLUMN id SET DEFAULT nextval('public."Players_id_seq"'::regclass);


--
-- Name: Units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Units" ALTER COLUMN id SET DEFAULT nextval('public."Units_id_seq"'::regclass);


--
-- Name: GameArenas GameArenas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GameArenas"
    ADD CONSTRAINT "GameArenas_pkey" PRIMARY KEY (id);


--
-- Name: GamePhases GamePhases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePhases"
    ADD CONSTRAINT "GamePhases_pkey" PRIMARY KEY (id);


--
-- Name: GamePieceActions GamePieceActions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePieceActions"
    ADD CONSTRAINT "GamePieceActions_pkey" PRIMARY KEY (id);


--
-- Name: GamePieces GamePieces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePieces"
    ADD CONSTRAINT "GamePieces_pkey" PRIMARY KEY (id);


--
-- Name: GamePlayers GamePlayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GamePlayers"
    ADD CONSTRAINT "GamePlayers_pkey" PRIMARY KEY (id);


--
-- Name: Games Games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Games"
    ADD CONSTRAINT "Games_pkey" PRIMARY KEY (id);


--
-- Name: PlayerUnits PlayerUnits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlayerUnits"
    ADD CONSTRAINT "PlayerUnits_pkey" PRIMARY KEY (id);


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
-- Name: Units Units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Units"
    ADD CONSTRAINT "Units_pkey" PRIMARY KEY (id);


--
-- Name: game_arenas_game_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_arenas_game_id ON public."GameArenas" USING btree ("gameId");


--
-- Name: game_phases_game_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_phases_game_id ON public."GamePhases" USING btree ("gameId");


--
-- Name: game_piece_actions_game_phase_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_piece_actions_game_phase_id ON public."GamePieceActions" USING btree ("gamePhaseId");


--
-- Name: game_piece_actions_game_piece_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_piece_actions_game_piece_id ON public."GamePieceActions" USING btree ("gamePieceId");


--
-- Name: game_piece_actions_game_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_piece_actions_game_player_id ON public."GamePieceActions" USING btree ("gamePlayerId");


--
-- Name: game_pieces_game_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_pieces_game_id ON public."GamePieces" USING btree ("gameId");


--
-- Name: game_pieces_game_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_pieces_game_player_id ON public."GamePieces" USING btree ("gamePlayerId");


--
-- Name: game_players_game_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_players_game_id ON public."GamePlayers" USING btree ("gameId");


--
-- Name: game_players_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_players_player_id ON public."GamePlayers" USING btree ("playerId");


--
-- Name: games_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX games_status ON public."Games" USING btree (status);


--
-- Name: games_winning_game_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX games_winning_game_player_id ON public."Games" USING btree ("winningGamePlayerId");


--
-- Name: player_units_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX player_units_player_id ON public."PlayerUnits" USING btree ("playerId");


--
-- Name: player_units_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX player_units_unit_id ON public."PlayerUnits" USING btree ("unitId");


--
-- Name: unique_game_phase_game_turn_gameplayer_phase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_game_phase_game_turn_gameplayer_phase ON public."GamePhases" USING btree ("gameId", "turnNumber", "gamePlayerId", phase);


--
-- Name: unique_game_piece_game_id_player_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_game_piece_game_id_player_unit_id ON public."GamePieces" USING btree ("gameId", "playerUnitId");


--
-- Name: unique_game_player_game_id_player_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_game_player_game_id_player_id ON public."GamePlayers" USING btree ("gameId", "playerId");


--
-- Name: unique_game_player_game_id_player_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_game_player_game_id_player_number ON public."GamePlayers" USING btree ("gameId", "playerNumber");


--
-- Name: unique_player_mina_public_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_player_mina_public_key ON public."Players" USING btree ("minaPublicKey");


--
-- Name: unique_player_unit_name_by_player; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_player_unit_name_by_player ON public."PlayerUnits" USING btree ("playerId", name);


--
-- Name: unique_unit_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_unit_name ON public."Units" USING btree (name);


--
-- PostgreSQL database dump complete
--

