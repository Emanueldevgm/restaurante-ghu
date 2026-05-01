CREATE DATABASE  IF NOT EXISTS `restaurante_angola_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `restaurante_angola_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restaurante_angola_db
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '32cad838-425d-11f1-8f95-002b6746be33:1-142';

--
-- Table structure for table `avaliacoes`
--

DROP TABLE IF EXISTS `avaliacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoes` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pedido_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nota` int NOT NULL,
  `comentario` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avaliacoes_chk_1` CHECK (((`nota` >= 1) and (`nota` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes`
--

LOCK TABLES `avaliacoes` WRITE;
/*!40000 ALTER TABLE `avaliacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `avaliacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nome` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nome_en` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_general_ci,
  `imagem` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ordem_exibicao` int DEFAULT '0',
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes_restaurante`
--

DROP TABLE IF EXISTS `configuracoes_restaurante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_restaurante` (
  `id` int NOT NULL DEFAULT '1',
  `nome_restaurante` varchar(100) COLLATE utf8mb4_general_ci DEFAULT 'Restaurante GHU',
  `taxa_entrega_base_kz` decimal(10,2) DEFAULT '1000.00',
  `tempo_preparo_padrao_min` int DEFAULT '30',
  `pedido_minimo_delivery_kz` decimal(10,2) DEFAULT '0.00',
  `aberto` tinyint(1) DEFAULT '1',
  `horario_funcionamento` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `configuracoes_restaurante_chk_1` CHECK (json_valid(`horario_funcionamento`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes_restaurante`
--

LOCK TABLES `configuracoes_restaurante` WRITE;
/*!40000 ALTER TABLE `configuracoes_restaurante` DISABLE KEYS */;
INSERT INTO `configuracoes_restaurante` VALUES (1,'Restaurante GHU',1000.00,30,0.00,1,NULL,'2026-04-08 19:21:17');
/*!40000 ALTER TABLE `configuracoes_restaurante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons`
--

DROP TABLE IF EXISTS `cupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupons` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('percentual','fixo') COLLATE utf8mb4_general_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `valor_minimo_pedido_kz` decimal(10,2) DEFAULT '0.00',
  `quantidade_disponivel` int DEFAULT NULL,
  `quantidade_usada` int DEFAULT '0',
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `status` enum('ativo','inativo') COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons`
--

LOCK TABLES `cupons` WRITE;
/*!40000 ALTER TABLE `cupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons_utilizados`
--

DROP TABLE IF EXISTS `cupons_utilizados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupons_utilizados` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `cupom_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pedido_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `valor_desconto_kz` decimal(10,2) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cupom_id` (`cupom_id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `cupons_utilizados_ibfk_1` FOREIGN KEY (`cupom_id`) REFERENCES `cupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cupons_utilizados_ibfk_2` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons_utilizados`
--

LOCK TABLES `cupons_utilizados` WRITE;
/*!40000 ALTER TABLE `cupons_utilizados` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupons_utilizados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enderecos_clientes`
--

DROP TABLE IF EXISTS `enderecos_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos_clientes` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nome_endereco` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `provincia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `municipio` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `bairro` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `rua` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `condominio` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apartamento` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ponto_referencia` text COLLATE utf8mb4_general_ci,
  `coordenadas_gps` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `principal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `enderecos_clientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos_clientes`
--

LOCK TABLES `enderecos_clientes` WRITE;
/*!40000 ALTER TABLE `enderecos_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `enderecos_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_cardapio`
--

DROP TABLE IF EXISTS `itens_cardapio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_cardapio` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `categoria_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nome_en` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_general_ci,
  `preco_kz` decimal(10,2) NOT NULL,
  `preco_promocional_kz` decimal(10,2) DEFAULT NULL,
  `tempo_preparo` int DEFAULT NULL,
  `calorias` int DEFAULT NULL,
  `vegetariano` tinyint(1) DEFAULT '0',
  `vegano` tinyint(1) DEFAULT '0',
  `sem_gluten` tinyint(1) DEFAULT '0',
  `picante` tinyint(1) DEFAULT '0',
  `status` enum('disponivel','indisponivel','esgotado') COLLATE utf8mb4_general_ci DEFAULT 'disponivel',
  `destaque` tinyint(1) DEFAULT '0',
  `prato_do_dia` tinyint(1) DEFAULT '0',
  `imagem` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ordem_exibicao` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `itens_cardapio_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_cardapio`
--

LOCK TABLES `itens_cardapio` WRITE;
/*!40000 ALTER TABLE `itens_cardapio` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_cardapio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_pedido`
--

DROP TABLE IF EXISTS `itens_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_pedido` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pedido_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `item_cardapio_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nome_item` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `preco_unitario_kz` decimal(10,2) NOT NULL,
  `quantidade` int NOT NULL,
  `subtotal_kz` decimal(10,2) NOT NULL,
  `observacoes` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `item_cardapio_id` (`item_cardapio_id`),
  CONSTRAINT `itens_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `itens_pedido_ibfk_2` FOREIGN KEY (`item_cardapio_id`) REFERENCES `itens_cardapio` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedido`
--

LOCK TABLES `itens_pedido` WRITE;
/*!40000 ALTER TABLE `itens_pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_acesso`
--

DROP TABLE IF EXISTS `logs_acesso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_acesso` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `metodo` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_general_ci,
  `status_code` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_acesso`
--

LOCK TABLES `logs_acesso` WRITE;
/*!40000 ALTER TABLE `logs_acesso` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_acesso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesas`
--

DROP TABLE IF EXISTS `mesas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mesas` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `numero` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `capacidade` int NOT NULL,
  `localizacao` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('normal','vip','familia','casal') COLLATE utf8mb4_general_ci DEFAULT 'normal',
  `ativa` tinyint(1) DEFAULT '1',
  `observacoes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesas`
--

LOCK TABLES `mesas` WRITE;
/*!40000 ALTER TABLE `mesas` DISABLE KEYS */;
/*!40000 ALTER TABLE `mesas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pedido_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `metodo` enum('dinheiro','multicaixa','multicaixa_express','transferencia_bancaria','paypal','unitel_money','atlantico_money') COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('pendente','processando','aprovado','recusado','estornado','cancelado') COLLATE utf8mb4_general_ci DEFAULT 'pendente',
  `valor_pago_kz` decimal(10,2) NOT NULL,
  `referencia_transacao` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `comprovativo_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `numero_pedido` int NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('entrega','retirada','mesa') COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('carrinho','pendente','confirmado','em_preparo','pronto','saiu_entrega','entregue','cancelado') COLLATE utf8mb4_general_ci DEFAULT 'carrinho',
  `endereco_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mesa_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `taxa_entrega_kz` decimal(10,2) DEFAULT '0.00',
  `distancia_km` decimal(5,2) DEFAULT NULL,
  `subtotal_kz` decimal(10,2) NOT NULL,
  `desconto_kz` decimal(10,2) DEFAULT '0.00',
  `total_kz` decimal(10,2) NOT NULL,
  `observacoes` text COLLATE utf8mb4_general_ci,
  `observacoes_entrega` text COLLATE utf8mb4_general_ci,
  `tempo_estimado` int DEFAULT NULL,
  `data_prevista_entrega` datetime DEFAULT NULL,
  `reserva_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupom_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `confirmado_em` timestamp NULL DEFAULT NULL,
  `finalizado_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `usuario_id` (`usuario_id`),
  KEY `endereco_id` (`endereco_id`),
  KEY `mesa_id` (`mesa_id`),
  KEY `reserva_id` (`reserva_id`),
  KEY `cupom_id` (`cupom_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`endereco_id`) REFERENCES `enderecos_clientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`mesa_id`) REFERENCES `mesas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_4` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_5` FOREIGN KEY (`cupom_id`) REFERENCES `cupons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mesa_id` varchar(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nome_cliente` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `telefone_cliente` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `email_cliente` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantidade_pessoas` int NOT NULL,
  `data_reserva` date NOT NULL,
  `hora_reserva` time NOT NULL,
  `status` enum('pendente','confirmada','em_andamento','finalizada','cancelada','nao_compareceu') COLLATE utf8mb4_general_ci DEFAULT 'pendente',
  `ocasiao_especial` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `confirmada_em` timestamp NULL DEFAULT NULL,
  `check_in_em` timestamp NULL DEFAULT NULL,
  `check_out_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `mesa_id` (`mesa_id`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`mesa_id`) REFERENCES `mesas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nome_completo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `telefone_alternativo` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `senha_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bi` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nif` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('cliente','administrador','garcom','cozinha','entregador','gerente') COLLATE utf8mb4_general_ci DEFAULT 'cliente',
  `status` enum('ativo','inativo','bloqueado') COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `foto_perfil` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `genero` enum('masculino','feminino','outro') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultimo_acesso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telefone` (`telefone`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `bi` (`bi`),
  UNIQUE KEY `nif` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES ('b85f3d54-42a5-11f1-a603-002b6746be33','Administrador Principal','admin@restauranteghu.com','900000000',NULL,'$2a$10$eczn.ZoBbEepRaSDyFnHG.HEbci.lVqIrAtrqVxpie1069eBgyv4y',NULL,NULL,'administrador','ativo',NULL,NULL,NULL,'2026-04-28 01:58:15','2026-04-28 01:58:15',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zonas_entrega`
--

DROP TABLE IF EXISTS `zonas_entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zonas_entrega` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `provincia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `municipios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `bairros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `taxa_entrega_kz` decimal(10,2) NOT NULL,
  `tempo_estimado_min` int DEFAULT NULL,
  `ativa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `zonas_entrega_chk_1` CHECK (json_valid(`municipios`)),
  CONSTRAINT `zonas_entrega_chk_2` CHECK (json_valid(`bairros`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zonas_entrega`
--

LOCK TABLES `zonas_entrega` WRITE;
/*!40000 ALTER TABLE `zonas_entrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `zonas_entrega` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-30 11:28:53