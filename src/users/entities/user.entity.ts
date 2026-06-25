import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;
}
