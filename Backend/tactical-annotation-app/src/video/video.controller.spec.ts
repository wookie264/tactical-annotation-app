import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import {
  Controller, Get, Post, Body, Patch, Param, Delete
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from 'src/video/Dto/video.dto';

describe('VideoController', () => {
  let controller: VideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
