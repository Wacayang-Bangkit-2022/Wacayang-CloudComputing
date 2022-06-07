CREATE TABLE `user_table` (
  `user_id` varchar(64) NOT NULL,
  `user_name` varchar(64) DEFAULT NULL,
  `user_email` varchar(64) DEFAULT NULL,
  `user_photo` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
);

CREATE TABLE `wayang_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `description` varchar(1024) NOT NULL,
  `image` varchar(1024) DEFAULT NULL,
  `video` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


CREATE TABLE `favorite_wayang` (
  `user_id` varchar(64) NOT NULL,
  `wayang_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`wayang_id`),
  KEY `wayang_id` (`wayang_id`),
  CONSTRAINT `favorite_wayang_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorite_wayang_ibfk_4` FOREIGN KEY (`wayang_id`) REFERENCES `wayang_table` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `user_comment` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) DEFAULT NULL,
  `wayang_id` int DEFAULT NULL,
  `comment_content` varchar(1024) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `wayang_id` (`wayang_id`),
  CONSTRAINT `user_comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_comment_ibfk_2` FOREIGN KEY (`wayang_id`) REFERENCES `wayang_table` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
