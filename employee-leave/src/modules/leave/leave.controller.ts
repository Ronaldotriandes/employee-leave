import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveService } from './leave.service';

@Controller('leave')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createLeaveDto: CreateLeaveDto) {
    console.log(createLeaveDto)
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get('employees-with-leaves')
  findEmployeesWithLeaves() {
    return this.leaveService.findEmployeesWithLeaves();
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLeaveDto: UpdateLeaveDto,
  ) {
    return this.leaveService.update(id, updateLeaveDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
