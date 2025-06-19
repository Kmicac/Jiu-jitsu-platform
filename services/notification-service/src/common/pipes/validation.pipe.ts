import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
  } from '@nestjs/common';
  import { plainToClass } from 'class-transformer';
  import { validate } from 'class-validator';
  
  @Injectable()
  export class CustomValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
  
      const object = plainToClass(metatype, value);
      const errors = await validate(object);
  
      if (errors.length > 0) {
        const errorMessages = errors.map((error) => 
          Object.values(error.constraints || {}).join(', ')
        );
        throw new BadRequestException(errorMessages);
      }
  
      return value;
    }
  
    private toValidate(metatype: Function): boolean {
      const types: Function[] = [String, Boolean, Number, Array, Object];
      return !types.includes(metatype);
    }
  }